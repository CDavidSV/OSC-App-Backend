import express from "express";
import categoryShema from "../../scheemas/categoryShema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/getAllCategories', authenticateAccessToken, (req: express.Request, res: express.Response) => {
    categoryShema.find()
        .then((categories) => {
            if (!categories) {
                return res.status(404).json({ status: "error", message: "categories not found" });
            }
            res.status(200).json({ status: "success", categories });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error fetching categories" });
        });
});

export default router;