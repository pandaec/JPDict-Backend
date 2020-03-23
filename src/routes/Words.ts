import {Request, Response, Router} from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import scraper from '@shared/Scraper';


const router = Router();

router.get('/jp/:word', async (req: Request, res: Response) => {
    const result = await scraper.getJP(req.params.word);

    return res.status(OK).json(result);
});

router.get('/en/:word', async (req: Request, res: Response) => {
     const result = await scraper.getEN(req.params.word);

     return res.status(OK).json(result);
});

export default router;