import Queue from './classes/Queue';
import {
  MAX_CONCURRENT_DOWNLOAD,
  MAX_RETRY_INIT_QUEUE,
} from './constants/system';
import { getModel } from './dataStore';
import logger from './logger';
import downloadQueueDAL from './models/dataAccess/downloadQueue';
import { DownloadQueue } from './models/entities/DownloadQueue';

var dlQueue = new Queue<DownloadQueue>({
  maxConcurrentProcess: MAX_CONCURRENT_DOWNLOAD,
  processFunction: async (data) => {
    const { modelName, downloadUrl } = data;
    const model = getModel(modelName);
    if (!model) {
      logger.info(
        `Model ${modelName} is currently not active. Skipping download of ${downloadUrl}`,
      );
      return false;
    }
    logger.info(`TODO: ACTUALLY download this url`);
    return true;
  },
});

const initDownloadQueue = async () => {
  let tryCount = 0;
  let isSuccess = false;
  while (!isSuccess && tryCount < MAX_RETRY_INIT_QUEUE) {
    tryCount++;
    try {
      const data = await downloadQueueDAL.getAll();
      dlQueue.enqueue(data);
      logger.info(
        `Init Download Queue Successful, queued: ${data.length} urls`,
      );
      isSuccess = true;
    } catch (error) {
      logger.error(`Failed to init download queue...`);
    }
  }
  if (!isSuccess) {
    logger.error(`Unable to init download queue several times, quitting`);
    process.exit(1);
  }
};

export { dlQueue, initDownloadQueue };
