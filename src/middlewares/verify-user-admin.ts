import { Request, Response, NextFunction } from 'express';
import UserDB from "../scheemas/userSchema";
import associationSchema from '../scheemas/associationSchema';

async function verifyUserIsAdmin(req: Request, res: Response, next: NextFunction) {
    let { user_id } = req.body || req.query;
    user_id = !user_id && req.user?.id;
    if (!user_id) {
        return res.status(400).json({ message: 'Missing user_id in request' });
    }

    // Get the association where the user is admin or owner
    try {
        const association = await associationSchema.findOne({ $or: [{ ownerId: user_id }, { colaborators: { $elemMatch: { userId: user_id, perms: 1 } } }]});
        if (!association) {
            return res.status(401).json({ status: "error", message: 'Unauthorized' });
        }

        return next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: 'Internal Server Error. Contact support.' });
    }
}

export default verifyUserIsAdmin;