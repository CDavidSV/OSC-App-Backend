import express from "express";
import UserDB from "../../scheemas/userSchema";
import multer from "multer";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import userSchema from "../../scheemas/userSchema";
import associationSchema from "../../scheemas/associationSchema";
import { DBUser } from "../../Models/database";
import { SavedAssociation } from "../../Models/interfaces";

const router: express.Router = express.Router();

// Configure multer for file uploads.
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/profile', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const username = req.query.username;
    const userId = req.query.uid;

    if (!username && !userId) return res.status(400).send({ status: "error", message: "No username or user id specified" });

    let user: DBUser | null;

    try {
        if (!userId) {
            user = await UserDB.findOne({ username: username });
        } else {
            user = await UserDB.findById(userId);
        }
    } catch (err) {
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch user" });
    }

    if (!user) return res.status(404).send({ status: "error", message: "User not found" });

    const userData = {
        id: user._id.toString(),
        username: user.username,
        profilePicture: user.profilePictureURL,
        email: user.email,
        phoneNumber: user.phoneNumber,
    }

    return res.status(200).send({ status: "success", message: "User found", data: userData });
});

router.post('/updateUsername', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { username } = req.body;

    if (!username) return res.status(400).send({ status: "error", message: "No username specified" });

    UserDB.findByIdAndUpdate(req.user!.id, { username: username }).then((user) => {
        res.status(200).send({ status: "success", message: "Username updated" });
    }).catch((err) => {
        res.status(500).send({ status: "error", message: "Error updating username" });
    });
});

router.get('/ownedAssociation', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const userId = req.user?.id;

    try {
        const assoc = await associationSchema.findOne({ ownerId: userId });
        if (!assoc) return res.status(404).send({ status: "error", message: "Association not found" });
    
        return res.status(200).send({ status: "success", message: "Association found", data: assoc });
    } catch {
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch association" });
    }
});

router.get('/getSavedAssociations', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    // Fetch the user's saved associations.
    userSchema.findById(req.user!.id).populate('savedAssociations')
    .then((user) => {
        const savedAssociations: SavedAssociation[] = user!.savedAssociations.map((assoc: any) => {
            return {
                id: assoc._id.toString(),
                name: assoc.name,
                description: assoc.description,
                logoURL: assoc.logoURL,
                rating: assoc.rating
            };
        });
    
        res.send({ status: "success", count: user?.savedAssociations.length, savedAssociations });
    })
    .catch((err) => {
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch user" })
    });
});

router.post('/saveAssociation', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { assocId } = req.body;

    if (!assocId) return res.status(400).send({ status: "error", message: "No association id specified" });

    try {
        // Check if the association exists.
        const assoc = await associationSchema.findById(assocId);
        if (!assoc) return res.status(404).send({ status: "error", message: "Association not found" });

        // Add the association to the user's saved associations.
        await userSchema.findByIdAndUpdate(req.user!.id, { $addToSet: { savedAssociations: assocId } });
        res.status(200).send({ status: "success", message: "Association saved" });
    } catch {
        res.status(500).send({ status: "error", message: "Error while attempting to save association" });
    }
});

router.delete('/unsaveAssociation', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { assocId } = req.body;

    if (!assocId) return res.status(400).send({ status: "error", message: "No association id specified" });

    userSchema.findByIdAndUpdate(req.user!.id, { $pull: { savedAssociations: assocId } }).then((user) => {
        res.status(200).send({ status: "success", message: "Association removed" });
    })
    .catch((err) => {
        res.status(500).send({ status: "error", message: "Error while attempting to remove association" });
    });
});

export default router;