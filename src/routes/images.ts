import express from 'express';
import path from 'path';

const router = express.Router();

const publicPath = path.resolve(__dirname, '..', 'public');

router.use('/', (req, res, next) => {
  console.log(`Request path: ${req.path}`);
  const fileExtension = path.extname(req.path).toLowerCase();

  if (fileExtension === '.jpg' || fileExtension === '.png') {
    next();
  } else {
    console.log('Blocked non-image file');
    res.status(403).send('Only image files are allowed.');
  }
}, express.static(publicPath));

export default router;