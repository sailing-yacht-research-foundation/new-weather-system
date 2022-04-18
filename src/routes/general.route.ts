import express, { Request, Response } from 'express';
import { systemStatus } from '../main';

import { loadConfigurations } from '../services/loadConfigurations';

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

router.get('/reload-configs', async (req: Request, res: Response) => {
  if (systemStatus.isLoadingConfigurations) {
    res.send({
      message: `Server is still processing new configuration requests`,
      timestamp: Date.now(),
    });
  } else {
    loadConfigurations();
    res.send({
      message: `Configurations will be loaded and requires some time for loading new configuration, please don't spam this.`,
      timestamp: Date.now(),
    });
  }
});

export default router;
