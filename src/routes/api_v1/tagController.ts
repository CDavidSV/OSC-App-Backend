import express from "express";
import TagDB from "../../scheemas/tagSchema";
import { validateJsonBody, JsonValidator, JsonValidatorResponse } from "../../util/validateInputSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/getTag/:id?', /* authenticateAccessToken */ (req: express.Request, res: express.Response) => {
    const tagId = req.params.id || req.query.id;

    TagDB.findById(tagId)
        .then((tag) => {
            if (!tag) {
                return res.status(404).json({ status: "error", message: "tag not found" });
            }
            res.status(200).json({ status: "success", tag });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error retrieving tag" });
        });
});

router.post('/createTag', /*authenticateAccessToken*/  async (req: express.Request, res: express.Response) => {
    try {
        const tagData = req.body;

        const newtag = new TagDB(tagData);
        await newtag.save();

        res.status(201).json({ message: 'tag created successfully', tagId: newtag._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/updateTag/:id?', /* authenticateAccessToken */ (req: express.Request, res: express.Response) => {
    const tagId = req.params.id || req.query.id;
    const updatedData = req.body;

    if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ status: "error", message: "No fields provided for update" });
    }

    TagDB.findByIdAndUpdate(tagId, updatedData, { new: true })
        .then((updatedtag) => {
            if (!updatedtag) {
                return res.status(404).json({ status: "error", message: "tag not found" });
            }
            res.status(200).json({ status: "success", message: "tag updated", updatedtag: updatedtag });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error updating tag" });
        });
});

router.delete('/deleteTag/:id?', /*authenticateAccessToken*/ (req: express.Request, res: express.Response) => {
    const tagId = req.params.id || req.query.id;

    TagDB.findByIdAndDelete(tagId)
        .then((deletedtag) => {
            if (!deletedtag) {
                return res.status(404).json({ status: "error", message: "tag not found" });
            }
            res.status(200).json({ status: "success", message: "tag deleted" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error deleting tag" });
        });
});

export default router;

