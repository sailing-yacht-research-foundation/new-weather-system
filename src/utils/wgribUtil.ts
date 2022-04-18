import { exec } from 'child_process';
import { promisify } from 'util';
import { BBox } from '@turf/turf';

import { deleteFile, readFile } from './fileSystem';
import { CsvOrderConfiguration } from '../types/General-type';
import logger from '../logger';

const execPromise = promisify(exec);

async function getGribDetail(
  file: string,
  csvOrder: CsvOrderConfiguration,
): Promise<{
  isSuccess: boolean;
  variables: string[];
  levels: string[];
  boundingBox?: BBox;
}> {
  const targetPath = file.replace('.grib2', '.csv');
  try {
    await execPromise(`wgrib2 ${file} -csv ${targetPath}`);
    const csvData = await readFile(targetPath, 'utf-8');
    await deleteFile(targetPath);
    const variables = new Set<string>();
    const levels = new Set<string>();

    let minLon: number | null = null;
    let minLat: number | null = null;
    let maxLon: number | null = null;
    let maxLat: number | null = null;

    csvData.split('\n').forEach((line) => {
      const lineComponents = line.split(',');
      if (lineComponents.length == 7) {
        levels.add(lineComponents[csvOrder.level].replace(/"/gm, ''));
        variables.add(lineComponents[csvOrder.variable].replace(/"/gm, ''));
        const [lon, lat] = [
          Number(lineComponents[csvOrder.lon]),
          Number(lineComponents[csvOrder.lat]),
        ];
        if (minLon == null || minLon > lon) {
          minLon = lon;
        }
        if (maxLon == null || maxLon < lon) {
          maxLon = lon;
        }

        if (minLat == null || minLat > lat) {
          minLat = lat;
        }
        if (maxLat == null || maxLat < lat) {
          maxLat = lat;
        }
      }
    });
    return {
      isSuccess: true,
      variables: Array.from(variables),
      levels: Array.from(levels),
      boundingBox:
        minLon && minLat && maxLon && maxLat
          ? [minLon, minLat, maxLon, maxLat]
          : undefined,
    };
  } catch (error) {
    logger.error(error);
    return {
      isSuccess: false,
      variables: [],
      levels: [],
      boundingBox: undefined,
    };
  }
}

export { getGribDetail };
