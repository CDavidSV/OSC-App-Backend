import express from "express";
import AssociationDB from "../../scheemas/associationSchema";
import reviewSchema from "../../scheemas/reviewSchema";
import { validateJsonBody, JsonValidator, JsonValidatorResponse } from "../../util/validateInputSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/getAssociation/:id?', /* authenticateAccessToken */ async (req: express.Request, res: express.Response) => {
    const associationId = req.params.id || req.query.id;
    const user_id = req.query.user_id;

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

router.post('/createAssociation', /*authenticateAccessToken*/  async (req: express.Request, res: express.Response) => {
    try {
        const associationData = req.body;

        const newAssociation = new AssociationDB(associationData);
        await newAssociation.save();

        res.status(201).json({ message: 'Association created successfully', associationId: newAssociation._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/updateAssociation/:id?', /* authenticateAccessToken */ (req: express.Request, res: express.Response) => {
    const associationId = req.params.id || req.query.id;
    const updatedData = req.body;

    if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ status: "error", message: "No fields provided for update" });
    }

    AssociationDB.findByIdAndUpdate(associationId, updatedData, { new: true })
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

router.delete('/deleteAssociation/:id?', /*authenticateAccessToken*/ (req: express.Request, res: express.Response) => {
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

