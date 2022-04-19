import db from '..';

import { InferCreationAttributes, Transaction } from 'sequelize/types';
import { FileToDownload } from '../entities/FileToDownload';

const getAll = async () => {
  const files = await db.fileToDownload.findAll({
    order: [['createdAt', 'ASC']],
  });
  return files;
};

const insert = async (
  data: InferCreationAttributes<FileToDownload>,
  options?: { transaction: Transaction },
) => {
  const result = await db.fileToDownload.create(data, options);
  return result;
};

const bulkInsert = async (
  data: { downloadUrl: string; modelName: string }[],
  options?: { transaction: Transaction },
) => {
  const result = await db.fileToDownload.bulkCreate(data, {
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
  const deletedCount = await db.fileToDownload.destroy({
    where: { id },
    ...options,
  });
  return deletedCount;
};

export default { getAll, insert, bulkInsert, deleteQueue };
