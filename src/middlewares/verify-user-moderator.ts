import { Request, Response, NextFunction } from 'express';
import UserDB from "../scheemas/userSchema";

async function verifyUserIsAdmin(req: Request, res: Response, next: NextFunction) {
    let { user_id } = req.body || req.query;
    user_id = !user_id && req.user?.id;
    if (!user_id) {
        return res.status(400).json({ message: 'Missing user_id in request' });
    }
    
    UserDB.findOne({ _id: user_id })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.assocPerms === 3) {
                return next();
            } else {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        })
        .catch(e => {
            console.log("Error:",e);
            return res.status(500).json({message: 'Internal Server Error. Contact support.'})
        });
}

export default verifyUserIsAdmin;
