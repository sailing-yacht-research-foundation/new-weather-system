import dotenv from 'dotenv';
dotenv.config();
import createServer from './server';
import logger from './logger';

const port = process.env.PORT || 3000;

(async () => {
  try {
    const app = createServer();
    if (app) {
      app.listen(port, () => {
        logger.info(`Weather Archiver has started! Listening on ${port}`);
      });
    }
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
