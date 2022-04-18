import path from 'path';
import * as turf from '@turf/turf';

import logger from '../logger';
import { deleteFile, readDirectory, readFile } from '../utils/fileSystem';
import sourceModelDAL from '../models/dataAccess/sourceModel';
import { downloadToFile } from '../utils/downloadUtil';
import { getGribDetail } from '../utils/wgribUtil';
import {
  refreshActiveModel,
  addActiveModel,
  getActiveModel,
} from '../dataStore';
import { systemStatus } from '../main';

import { ConfigurationFileContent } from '../types/General-type';

export const loadConfigurations = async () => {
  systemStatus.isLoadingConfigurations = true;
  const configFolder = path.resolve(__dirname, '../configurations');

  const files = await readDirectory(configFolder);
  const configurationFiles = files.filter((file) => {
    return file.endsWith('.json');
  });
  logger.info(`Found ${configurationFiles.length} configurations.`);
  if (configurationFiles.length > 0) {
    refreshActiveModel();
  }
  for (let file of configurationFiles) {
    let downloadedFilePath: string | null = null;
    try {
      const config = JSON.parse(
        await readFile(`${configFolder}/${file}`, 'utf-8'),
      ) as ConfigurationFileContent;
      const {
        name,
        file_format: fileFormat,
        csv_order: csvOrder,
        spatial_resolution: spatialResolution,
        spatial_resolution_units: spatialResolutionUnits,
        availability_utc: availabilityUtc,
        timestep = null,
        file_list: fileList = null,
        file_url: fileUrl,
        help_url: helpUrl = null,
      } = config;

      const existingModel = await sourceModelDAL.findByName(name);
      if (existingModel) {
        logger.info(`Configuration ${name} from ${file} exists`);
        addActiveModel(existingModel);
        continue;
      }
      logger.info(
        `Configuration ${name} from ${file} will be checked and added`,
      );

      // Get 1 sample file to download
      const currentTime = new Date();
      let selectedReleaseTime: string | null = null;
      let selectedDate: Date | null = null;
      for (let row of availabilityUtc) {
        const availTime = new Date();
        const { available_time: availableTime, release_time: releaseTime } =
          row;
        availTime.setUTCHours(Number(availableTime.split(':')[0]));
        availTime.setUTCMinutes(Number(availableTime.split(':')[1]));
        if (availTime <= currentTime) {
          selectedDate = availTime;
          selectedReleaseTime = releaseTime;

          if (
            currentTime.getHours() * 60 + currentTime.getMinutes() <
            Number(releaseTime.split(':')[0]) * 60 +
              Number(releaseTime.split(':'[1]))
          ) {
            // Release time is larger than current datetime
            selectedDate.setDate(availTime.getDate() - 1);
          }
          break;
        }
      }

      if (!selectedDate) {
        // Use previous date's last release
        const { available_time: availableTime, release_time: releaseTime } =
          availabilityUtc[availabilityUtc.length - 1];
        selectedDate = new Date();
        selectedDate.setDate(selectedDate.getDate() - 1);
        selectedDate.setUTCHours(Number(availableTime.split(':')[0]));
        selectedDate.setUTCMinutes(Number(availableTime.split(':')[1]));
        selectedReleaseTime = releaseTime;
      }
      if (!selectedDate || !selectedReleaseTime) {
        logger.error(`Config from ${file} are invalid`);
        continue;
      }

      let url = fileUrl
        .replaceAll('{YEAR_STRING}', String(selectedDate.getUTCFullYear()))
        .replaceAll(
          '{MONTH_STRING}',
          String(selectedDate.getUTCMonth() + 1).padStart(2, '0'),
        )
        .replaceAll(
          '{DATE_STRING}',
          String(selectedDate.getUTCDate()).padStart(2, '0'),
        )
        .replaceAll('{RELEASE_TIME}', selectedReleaseTime.substring(0, 2));
      if (timestep) {
        const timestepReplacer =
          timestep.padding > 0
            ? String(timestep.beginning).padStart(timestep.padding, '0')
            : String(timestep.beginning);
        url = url.replaceAll('{TIME_STEP}', timestepReplacer);
      } else if (fileList && fileList.length > 0) {
        url = `${url}${fileList[0]}`;
      }
      const { isSuccess, targetPath } = await downloadToFile(url, fileFormat);
      if (!isSuccess) {
        logger.info(
          `Configuration ${name} sample file are not downloadable. Skipping`,
        );
        continue;
      }
      downloadedFilePath = targetPath;

      const gribDetail = await getGribDetail(targetPath, csvOrder);
      if (!gribDetail.isSuccess) {
        logger.info(
          `Configuration ${name} sample file fail to extract grib. Skipping`,
        );
        continue;
      }
      let spatialBoundary = null;
      const { variables, levels, boundingBox } = gribDetail;
      if (boundingBox) {
        if (
          boundingBox[3] - boundingBox[1] >= 180 &&
          boundingBox[2] - boundingBox[0] >= 360 - spatialResolution
        ) {
          spatialBoundary = null;
        } else {
          spatialBoundary = turf.bboxPolygon(boundingBox);
        }
      }

      const newModel = await sourceModelDAL.insert({
        name,
        fileFormat,
        csvOrder,
        spatialResolution,
        spatialResolutionUnits,
        availabilityUtc: availabilityUtc.map((row) => ({
          releaseTime: row.release_time,
          availableTime: row.available_time,
        })),
        timestep,
        fileUrl,
        fileList: null, // TODO: Implement file list based
        helpUrl,
        spatialBoundary: spatialBoundary
          ? {
              ...spatialBoundary.geometry,
              crs: {
                type: 'name',
                properties: { name: 'EPSG:4326' },
              },
            }
          : null,
        levels,
        variables,
        paramList: null, // TODO: Use paramList from config
      });
      addActiveModel(newModel);
    } catch (error) {
      logger.error(error);
    }

    if (downloadedFilePath) {
      try {
        await deleteFile(downloadedFilePath);
      } catch (error) {
        logger.error(
          `Failed to delete a grib sample file: ${downloadedFilePath}`,
        );
      }
    }
  }

  const activeModels = getActiveModel();
  logger.info(
    `Configurations loaded for models: ${activeModels
      .map((row) => row.name)
      .join(', ')}`,
  );
  systemStatus.isLoadingConfigurations = false;
};
