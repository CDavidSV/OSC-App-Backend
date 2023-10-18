import express from "express";
import AssociationDB from "../../scheemas/associationSchema";
import reviewSchema from "../../scheemas/reviewSchema";
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
      const associations = await AssociationDB.find(query);
      
      // Calculando el promedio de valoraciones para cada asociación
      const assocationIds = associations.map(association => association._id.toString());
      const reviews = await reviewSchema.find({ assocId: { $in: assocationIds }});

      const response = associations.map(association => {
          // Get all reviews for this association
          const reviewsForThisAssociation = reviews.filter(review => review.assocId === association._id.toString());
          
          // Calculate average rating
          const totalRating = reviewsForThisAssociation.reduce((sum, review) => sum + review.rating, 0);
          const rating = reviewsForThisAssociation.length ? totalRating / reviewsForThisAssociation.length : undefined;
          return { ...association.toJSON(), rating };
      });

      return res.status(200).json({
          status: "success",
          message:"Associations retrieved successfully with average ratings.",
          associations: response
      });

  } catch (err) {
      console.log(err);
      return res.status(500).send({ status: "error", message: "Error while attempting to fetch query results" });
  } 
});

export default router;