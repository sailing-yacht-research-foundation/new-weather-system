import db from '..';

import { InferCreationAttributes, Transaction } from 'sequelize/types';
import { DownloadQueue } from '../entities/DownloadQueue';

const getAll = async () => {
  const downloadQueue = await db.downloadQueue.findAll({
    order: [['createdAt', 'ASC']],
  });
  return downloadQueue;
};

const insert = async (
  data: InferCreationAttributes<DownloadQueue>,
  options?: { transaction: Transaction },
) => {
  const result = await db.downloadQueue.create(data, options);
  return result;
};

const bulkInsert = async (
  data: { downloadUrl: string; modelName: string }[],
  options?: { transaction: Transaction },
) => {
  const result = await db.downloadQueue.bulkCreate(data, {
    ...options,
    ignoreDuplicates: true,
    validate: true,
  });
  return result;
};

const deleteQueue = async (
  id: string,
  options?: { transaction: Transaction },
) => {
  const deletedCount = await db.downloadQueue.destroy({
    where: { id },
    ...options,
  });
  return deletedCount;
};

export default { getAll, insert, bulkInsert, deleteQueue };
