import path from 'path';
import fs from 'fs';
import { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ProgressBar from 'progress';

import { makeDirectory } from './fileSystem';

const generateTimesteppedDownloadUrl = (data: {
  fileUrl: string;
  date: Date;
  releaseTime: string;
  timestepPadding: number;
  timestepIndex: number;
}) => {
  const { fileUrl, date, releaseTime, timestepIndex, timestepPadding } = data;
  const paddedTimestep = String(timestepIndex).padStart(timestepPadding, '0');

  const dayString = String(date.getUTCDate()).padStart(2, '0');
  const monthString = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yearString = String(date.getUTCFullYear());
  let url = fileUrl
    .replaceAll('Y%Y%Y%Y%', yearString)
    .replaceAll('M%M%', monthString)
    .replaceAll('D%D%', dayString)
    .replaceAll('R%R%', releaseTime.substring(0, 2))
    .replaceAll(new Array(timestepPadding + 1).join('T%'), paddedTimestep);

  return url;
};

const downloadToFile = async (urlToDownload: string, fileFormat: string) => {
  const folder = path.resolve(__dirname, '../../operating_folder');
  try {
    await fs.promises.access(folder);
    // The check succeeded
  } catch (error) {
    // The check failed
    await makeDirectory(folder);
  }
  const fileName = path.basename(urlToDownload);
  const targetPath = `${folder}/${uuidv4()}.${fileFormat}`;

  const writeStream = fs.createWriteStream(targetPath);
  const { success, message } = await streamFile(urlToDownload, writeStream);
  return {
    originalFileName: fileName,
    targetPath,
    isSuccess: success,
    message,
  };
};

const streamFile = async (url: string, writeStream: fs.WriteStream) => {
  try {
    const { data, headers } = await axios.get<Stream>(url, {
      url,
      responseType: 'stream',
    });
    return new Promise<{ success: boolean; message: string }>(
      async (resolve, reject) => {
        data.pipe(writeStream);
        const totalLength = headers['content-length'];
        if (totalLength) {
          const progressBar = new ProgressBar(
            '-> downloading [:bar] :percent :etas',
            {
              width: 50,
              complete: '=',
              incomplete: ' ',
              renderThrottle: 1,
              total: parseInt(totalLength),
            },
          );
          data.on('data', (chunk) => progressBar.tick(chunk.length));
        }
        const errorHandler = (err: any) => {
          reject({
            success: false,
            message: err.message,
          });
        };
        const resolveStream = () => {
          resolve({
            success: true,
            message: '',
          });
        };
        data.on('error', errorHandler);
        writeStream.on('error', errorHandler);
        writeStream.on('close', resolveStream);
      },
    );
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export { generateTimesteppedDownloadUrl, downloadToFile, streamFile };
