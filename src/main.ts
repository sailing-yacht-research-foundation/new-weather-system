import dotenv from 'dotenv';
dotenv.config();
import createServer from './server';
import logger from './logger';
import db from './models/index';
import { loadConfigurations } from './services/loadConfigurations';
import { startScheduler } from './services/scheduler';
import { initDownloadQueue } from './jobQueues';

const port = process.env.PORT || 3000;
var systemStatus = {
  isLoadingConfigurations: false,
};

(async () => {
  try {
    await db.startDB();
    logger.info('DB Connected');
    const app = createServer();
    if (app) {
      app.listen(port, async () => {
        logger.info(`Weather Archiver has started! Listening on ${port}`);
        await loadConfigurations();
        startScheduler();
        await initDownloadQueue();
      });
    }
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();

export { systemStatus };
