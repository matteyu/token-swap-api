import { Router } from 'express';
import { getQuote } from '../services/quote';

const router: Router = Router();

router.post('/', getQuote);

export default router;
