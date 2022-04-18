import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('SYRF - new-weather-archiver');
});
router.get('/health', (req: Request, res: Response) => {
  res.send({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  });
});

export default router;
