import express from "express";
import AssociationDB from "../../scheemas/associationSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.post('/search', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    let { categories, tags, queryText } = req.body;

    if (!categories && !tags && !queryText) return res.status(400).send({ status: "error", message: "No search parameters specified" });

    let query: any = {};
    if (queryText && queryText.length >=3) {
      query.queryText = queryText;
    }
    if (categories) {
      query.categories = { $in: categories };
    }
    if (tags) {
      query.tags = { $in: tags };
    }

    try {
        const results = await AssociationDB.find(query).exec();
          return res.status(200).json({
            message:"Associations retrieved succesfully.",
            results
          });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch query results" });
    } 
});

export default router;