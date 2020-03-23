import { Router } from 'express';
import UserRouter from './Users';
import WordRouter from './Words';
import WordListRouter from './WordList';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/w', WordRouter);
router.use('/wl', WordListRouter);

// Export the base-router
export default router;
