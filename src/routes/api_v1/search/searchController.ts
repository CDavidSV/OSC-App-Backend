import express from "express";
import AssociationDB from "../../../scheemas/associationSchema";
import { authenticateAccessToken } from "../../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/seed', (req: express.Request, res: express.Response) => {
  const sampleAssociation = new AssociationDB({
    name: 'Sample Association',
    description: 'A description of the sample association.',
    logoURL: 'https://example.com/logo.png',
    images: ['https://example.com/image1.png', 'https://example.com/image2.png'],
    thumbnailURL: 'https://example.com/thumbnail.png',
    websiteURL: 'https://example.com',
    facebookURL: 'https://facebook.com/sample',
    instagramURL: 'https://instagram.com/sample',
    categoryId: 'category123',
    tags: ['tag1', 'tag2', 'tag3'],
    contact: {
      email: 'contact@example.com',
      phone: '+1234567890',
      whatsapp: '+1234567890',
    },
    address: '123 Main Street, City, Country',
    rating: 4.5,
  });
  
  // Save the sample document to the database
  return sampleAssociation.save()
    .then((savedAssociation) => {
      console.log('Sample association saved:', savedAssociation);
      return res.status(200)
    })
    .catch((error) => {
      console.error('Error saving sample association:', error);
      return res.status(500);
    });

})

router.get('/search' , async (req: express.Request, res: express.Response)=> {
    const query = req.query.query as string; 
    let { categoriesIds, tagsIds } = req.body;
    categoriesIds=['1','2']
    tagsIds=['tag1','tag2']
    try {
        const associationsWithName = await AssociationDB.find({ $text: { $search: query } }).exec();
        const associationWithTagsAndCategories = await AssociationDB.find({
            $or: [
              { categories: { $in: categoriesIds }, tags: { $in: tagsIds } },
              { categories: { $in: categoriesIds } },
              { tags: { $in: tagsIds } },
            ],
          }).exec();
          return res.status(200).json({
            message:"Associations retrieved succesfully.",
            associationsWithName,
            associationWithTagsAndCategories
          });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: "error", message: "Error while attempting to fetch query results" });
    } 
});

export default router;