import { Request, Response, NextFunction } from 'express';
import UserDB from "../scheemas/userSchema";
import associationSchema from '../scheemas/associationSchema';

async function verifyUserIsOwner(req: Request, res: Response, next: NextFunction) {
    let { user_id } = req.body || req.query;
    user_id = !user_id && req.user?.id;
    if (!user_id) {
        return res.status(400).json({ message: 'Missing user_id in request' });
    }
    
    associationSchema.findById(user_id).then((association) => {
        if (!association) {
            return res.status(404).json({ status: "error", message: 'Association not found' });
        }

        if (association.ownerId === user_id) {
            return next();
        } else {
            return res.status(401).json({ status: "error", message: 'Unauthorized' });
        }
    }).catch((err) => {
        console.error(err);
        return res.status(500).json({ status: "error", message: 'Internal Server Error. Contact support.' });
    });
}

export default verifyUserIsOwner;