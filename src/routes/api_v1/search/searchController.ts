import express from "express";
import AssociationDB from "../../../scheemas/associationSchema";
import TagDB from "../../../scheemas/tagSchema";
import CategoryDB from "../../../scheemas/categoryShema";
import { authenticateAccessToken } from "../../../middlewares/auth-controller";
import { DBAssociation } from "../../../Models/database";

const router: express.Router = express.Router();

router.get('/search', authenticateAccessToken , async (req: express.Request, res: express.Response)=> {
    const query = req.query.query as string;
    const words_to_search = query && query.split(" ");
    const result: {
        by_name: DBAssociation[],
        by_tag: DBAssociation[],
        by_category: DBAssociation[],
        general: DBAssociation[]
    } = {
        by_name: [],
        by_tag: [],
        by_category: [],
        general: []
    };
    try {
        for (let i = 0; i < words_to_search.length; i++) {
            const word = words_to_search[i];
                
            // Search for associations by name
            const associationsByName = await AssociationDB.find({ name: { $regex: word, $options: 'i' } }) as DBAssociation[];
            result.by_name.push(...associationsByName);
            result.general.push(...associationsByName);
            
            // Tag id associated to word
            const word_tag = await TagDB.findOne({ name: word });
            const tag_id = word_tag?._id;
    
            // Search for associations by tag
            const associationsByTag = await AssociationDB.find({ tags: { $in: [tag_id] } }) as DBAssociation[];
            result.by_tag.push(...associationsByTag);
            result.general.push(...associationsByTag);
    
            // Category id associated to word
            const word_category = await CategoryDB.findOne({ name: word });
            const category_id = word_category?._id;
    
            // Search for associations by category
            const associationsByCategory = await AssociationDB.find({ categoryId: category_id }) as DBAssociation[];
            result.by_category.push(...associationsByCategory);
            result.general.push(...associationsByCategory);
        }
    } catch (err) {
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch query results" });
    } 

    return res.json(result);
});

export default router;