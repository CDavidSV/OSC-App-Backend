import express from "express";
import AssociationDB from "../../scheemas/associationSchema";
import verifyUserIsMod from "../../middlewares/verify-user-moderator";
import verifyUserIsOwner from "../../middlewares/verify-user-owner";
import reviewSchema from "../../scheemas/reviewSchema";
import { validateJsonBody, JsonValidator, JsonValidatorResponse } from "../../util/validateInputSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import associationSchema from "../../scheemas/associationSchema";
import verifyUserIsAdmin from "../../middlewares/verify-user-admin";

const router: express.Router = express.Router();

router.get('/getAssociation/:id?', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const associationId = req.params.id || req.query.id;
    const user_id = req.query.user_id || req.user?.id;

    try {
        const association = await AssociationDB.findById(associationId);

        if (!association) {
            return res.status(404).json({ status: "error", message: "Association not found" });
        }

        let user_perms = 4;
        const foundCollaborator = association.colaborators.find(collaborator => 
            collaborator.userId === user_id
        );

        if (foundCollaborator) {
            user_perms = foundCollaborator.perms;
        }

        // Obtiene todas las valoraciones de esa asociación
        const reviews = await reviewSchema.find({ assocId: associationId });

        // Calcula el promedio
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const rating = reviews.length ? totalRating / reviews.length : 0;
        
        const response = { ...association.toJSON(), rating };
        res.status(200).json({ status: "success", user_perms: user_perms, association: response, rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error retrieving association" });
    }
});

router.post('/createAssociation', authenticateAccessToken,  async (req: express.Request, res: express.Response) => {
    try {
        let associationData = req.body;
        associationData.ownerId = req.user?.id;
        const newAssociation = new AssociationDB(associationData);
        await newAssociation.save();

        res.status(201).json({ message: 'Association created successfully', associationId: newAssociation._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/updateAssociation/:id?', [authenticateAccessToken, verifyUserIsAdmin], (req: express.Request, res: express.Response) => {
    const associationId = req.params.id || req.query.id;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ status: "error", message: "No fields provided for update" });
    }

    const associationSchema: { [key: string]: JsonValidator } = {
        description: { type: "string", required: false },
        email: { type: "string", required: false },
        phone: { type: "string", required: false },
        whatsapp: { type: "string", required: false },
        facebook: { type: "string", required: false },
        instagram: { type: "string", required: false },
        youtube: { type: "string", required: false },
        linkedin: { type: "string", required: false }
    }
    const validationResult  = validateJsonBody(req.body, associationSchema);
    if (!validationResult.valid) {
        return res.status(400).json({ status: "error", message: "Invalid fields provided", missing: validationResult.missing, invalid: validationResult.invalid });
    }
    
    const updateFields: { [key: string]: string } = {};
    // Populate only if not null or undefined
    for (const key of Object.keys(req.body)) {
        if (req.body[key] === null) continue;
        
        if (['email', 'phone', 'whatsapp'].includes(key)) {
            updateFields[`contact.${key}`] = req.body[key];
        } else {
            updateFields[`${key}URL`] = req.body[key];
        }
    }

    AssociationDB.findByIdAndUpdate(associationId, updateFields, { new: true })
    .then((updatedAssociation) => {
        if (!updatedAssociation) {
            return res.status(404).json({ status: "error", message: "Association not found" });
        }
        res.status(200).json({ status: "success", message: "Association updated", updatedAssociation: updatedAssociation });
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error updating association" });
    });
});

router.delete('/deleteAssociation/:id?', [authenticateAccessToken, verifyUserIsOwner], (req: express.Request, res: express.Response) => {
    const associationId = req.params.id || req.query.id;

    AssociationDB.findByIdAndDelete(associationId)
        .then((deletedAssociation) => {
            if (!deletedAssociation) {
                return res.status(404).json({ status: "error", message: "Association not found" });
            }
            res.status(200).json({ status: "success", message: "Association deleted" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error deleting association" });
        });
});

export default router;