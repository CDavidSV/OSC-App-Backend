import express from "express";
import AssociationDB from "../../scheemas/associationSchema";
import { validateJsonBody, JsonValidator, JsonValidatorResponse } from "../../util/validateInputSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.post('/search', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    let { categories, tags, queryText } = req.body;
    if (!categories && !tags && !queryText) return res.status(400).send({ status: "error", message: "No search parameters specified" });

    const searchSchema: { [key: string]: JsonValidator } = {
        categories: { type: 'array', required: false },
        tags: { type: 'array', required: false },
        queryText: { type: 'string', required: false },
    };

    const validation = validateJsonBody(req.body, searchSchema);
    if (!validation.valid) {
        return res.status(400).send({ status: "error", message: "Invalid request body", missing: validation.missing, invalid: validation.invalid });
    }

    let query: any = {};
    if (queryText && queryText.length >= 3) {
      query.$text = { $search: queryText };
    }
    if (categories && categories.length > 0) {
      query.categoryId = { $in: categories };
    }
    if (tags && tags.length > 0) {
      query.tags = { $all: tags };
    }

    try {
        const results = await AssociationDB.find(query);
          return res.status(200).json({
            status: "success",
            message:"Associations retrieved succesfully.",
            results
          });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch query results" });
    } 
});

export default router;