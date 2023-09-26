import express from "express";
import reviewSchema from "../../scheemas/reviewSchema";
import { Review } from "../../Models/interfaces";
import { JsonValidator, validateJsonBody } from "../../util/validateInputSchema";
import mongoose from "mongoose";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get('/fetch', async (req: express.Request, res: express.Response) => {
    let page: number = parseInt(req.query.page as string) || 1;
    const limit: number = 100;
    const skip: number = (page - 1) * limit;

    const { id } = req.query;
    if (!id) return res.status(400).json({ status: "error", message: "Missing association id." });

    // Search for the reviews in the database based on page.
    try {
        const reviewsCount = await reviewSchema.countDocuments();
        const totalPages = Math.ceil(reviewsCount / limit);
        page = page > totalPages ? totalPages : page;

        const reviewsFetched = await reviewSchema.find({ private: false, assocId: id }).skip(skip).limit(100).populate('user').sort({ createdAt: -1 }).exec();
        
        const reviewsList: Review[] = [];
        reviewsFetched.map((review: any) => {
            reviewsList.push({
                assocId: review.assocId.toString(),
                content: review.content,
                createdAt: review.createdAt,
                upvotes: review.upvotes,
                downvotes: review.downvotes,
                rating: review.rating,
                private: review.private,
                user: {
                    id: review.user._id,
                    username: review.user.username,
                    profilePictureURL: review.user.profilePictureURL
                }
            });
        });
        const response = {
            status: "success",
            pages: totalPages,
            count: reviewsFetched.length,
            page: page,
            reviews: reviewsList
        }

        res.status(200).send(response);
    } catch {
        res.status(500).json({ status: "error", message: "Unnable to fetch reviews. Please try again later." });
    }
});

router.post('/post', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { assocId, content, rating, isPrivate } = req.body;

    const reviewPostSchema: { [key: string]: JsonValidator } = {
        assocId: { required: true, type: 'string' },
        content: { required: true, type: 'string' },
        rating: { required: true, type: 'number' },
        isPrivate: { required: true, type: 'boolean' }
    }

    const validationResult = validateJsonBody(req.body, reviewPostSchema);
    if (!validationResult.valid) return res.status(400).json({ status: "error", message: "Invalid request body", missing: validationResult.missing, invalid: validationResult.invalid });

    if (rating < 0 || rating > 5) return res.status(400).json({ status: "error", message: "Rating must be between 1 and 5." });
    if (content.length > 2000) return res.status(400).json({ status: "error", message: "Review content must be less than 2000 characters." });

    // Check if the association id is valid.
    if (!mongoose.Types.ObjectId.isValid(assocId)) return res.status(400).json({ status: "error", message: "Invalid association id." });

    try {
        // Check if the user has already posted a review.
        const reviewExists = await reviewSchema.exists({ assocId: assocId, userId: req.user?.id });

        // Check if the association exists.
        const associationExists = await reviewSchema.exists({ _id: assocId });

        if (reviewExists) return res.status(400).json({ status: "error", message: "You have already posted a review for this association." });
        if (!associationExists) return res.status(400).json({ status: "error", message: "Association does not exist." });

        // Create the review in the database.
        const review = await reviewSchema.create({
            assocId: new mongoose.Types.ObjectId(assocId),
            userId: new mongoose.Types.ObjectId(req.user?.id),
            content: content,
            createdAt: new Date(),
            upvotes: 0,
            downvotes: 0,
            rating: rating,
            private: isPrivate
        });

        res.status(200).json({ status: "success", message: "Review posted successfully.", id: review._id });
    } catch {
        return res.status(500).json({ status: "error", message: "Unnable to post review. Please try again later." });
    }
});

router.post('/update', authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const { reviewId, content, rating, isPrivate } = req.body;

    const reviewUpdateSchema: { [key: string]: JsonValidator } = {
        reviewId: { required: true, type: 'string' },
        content: { required: false, type: 'string' },
        rating: { required: false, type: 'number' },
        isPrivate: { required: false, type: 'boolean' }
    }

    const validationResult = validateJsonBody(req.body, reviewUpdateSchema);
    if (!validationResult.valid) return res.status(400).json({ status: "error", message: "Invalid request body", missing: validationResult.missing, invalid: validationResult.invalid });

    if (rating && (rating < 0 || rating > 5)) return res.status(400).json({ status: "error", message: "Rating must be between 1 and 5." });
    if (content && content.length > 2000) return res.status(400).json({ status: "error", message: "Review content must be less than 2000 characters." });

    // Check if the user attempting to update the review is the one who posted it.
    const review = await reviewSchema.findById(reviewId);
    if (!review) return res.status(400).json({ status: "error", message: "Review does not exist." });
    if (review.userId.toString() !== req.user?.id) return res.status(400).json({ status: "error", message: "You are not authorized to update this review." });

    // Check if the review id is valid.
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).json({ status: "error", message: "Invalid review id." });

    try {
        await reviewSchema.findByIdAndUpdate(reviewId, {
            content: content,
            rating: rating,
            private: isPrivate
        });
        res.status(200).send({ status: "success", message: "Review updated successfully." });
    } catch {
        res.status(200).send({ status: "success", message: "Unable to edit review. Please try again." });
    }
});

// router.delete('/delete', (req: express.Request, res: express.Response) => {});

// router.post('/react', (req: express.Request, res: express.Response) => {});

export default router;