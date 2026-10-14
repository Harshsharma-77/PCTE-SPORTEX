import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

const router = Router();

// Public / Authenticated Omnisearch endpoint
router.get('/', SearchController.omnisearch);

export default router;
