import schedule from 'node-schedule';

import { POPULATE_DOWNLOAD_SCHEDULER_NAME } from '../constants/system';
import { getActiveModel } from '../dataStore';
import downloadQueueDAL from '../models/dataAccess/downloadQueue';
import logger from '../logger';
import { dlQueue } from '../jobQueues';

var populateDownloadJob: schedule.Job;

function startScheduler() {
  populateDownloadJob = schedule.scheduleJob(
    POPULATE_DOWNLOAD_SCHEDULER_NAME,
    '* * * * *',
    () => {
      // Populate download links based on active scheduled downloads\
      const activeModels = getActiveModel();
      const currentDate = new Date();
      const currentDay = currentDate.getUTCDate();
      const currentMonth = currentDate.getUTCMonth() + 1;
      const currentYear = currentDate.getUTCFullYear();
      const currentHour = currentDate.getUTCHours();
      const currentMinute = currentDate.getUTCMinutes();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(
        currentMinute,
      ).padStart(2, '0')}`;

      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      const newUrlsToDownload: {
        modelName: string;
        downloadUrl: string;
      }[] = [];
      for (let model of activeModels) {
        const {
          name: modelName,
          availabilityUtc,
          fileList,
          fileUrl,
          timestep,
        } = model;
        for (let i = 0; i < availabilityUtc.length; i++) {
          const { releaseTime, availableTime } = availabilityUtc[i];
          if (currentTime === availableTime) {
            logger.info(
              `Running populating scheduler: ${modelName} should have some files ready to download at this time`,
            );
            let dayString = String(currentDay).padStart(2, '0');
            let monthString = String(currentMonth).padStart(2, '0');
            let yearString = String(currentYear);

            const availTime = Number(availableTime.replace(':', ''));
            const fileTime = Number(releaseTime.replace(':', ''));

            if (availTime < fileTime) {
              dayString = String(yesterday.getUTCDate()).padStart(2, '0');
              monthString = String(yesterday.getUTCMonth() + 1).padStart(
                2,
                '0',
              );
              yearString = String(yesterday.getUTCFullYear());
            }

            const baseUrl = fileUrl
              .replaceAll('{YEAR_STRING}', yearString)
              .replaceAll('{MONTH_STRING}', monthString)
              .replaceAll('{DATE_STRING}', dayString)
              .replaceAll('{RELEASE_TIME}', releaseTime.substring(0, 2));

            let totalFileCount = 0;
            if (fileList && fileList.length > 0) {
              // File based download
              fileList.forEach((fileName) => {
                totalFileCount++;
                newUrlsToDownload.push({
                  modelName,
                  downloadUrl: `${baseUrl}${fileName}`,
                });
              });
            }
            if (timestep) {
              // Timestep based download, need to generate the file names
              const { padding, beginning, max, resolution } = timestep;
              for (
                let index = beginning;
                index <= resolution * max;
                index += resolution
              ) {
                // Padding 0 means the url doesn't pad the timesteps
                const timestepReplacer =
                  padding > 0
                    ? String(index).padStart(padding, '0')
                    : String(index);
                newUrlsToDownload.push({
                  modelName,
                  downloadUrl: baseUrl.replaceAll(
                    '{TIME_STEP}',
                    timestepReplacer,
                  ),
                });
                totalFileCount++;
              }
            }

            logger.info(
              `${modelName} generated ${totalFileCount} download urls`,
            );
          }
        }
      }
      downloadQueueDAL.bulkInsert(newUrlsToDownload).then((data) => {
        if (data.length > 0) {
          dlQueue.enqueue(data);
          logger.info(`New URLs has been queued`);
        }
      });
    },
  );
}
export { startScheduler };
