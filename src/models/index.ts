import { Sequelize } from 'sequelize';

import SourceModel from './entities/SourceModel';
import FileToDownload from './entities/FileToDownload';

const dbName = process.env.DB_NAME || 'localhost';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbPort = process.env.DB_PORT || '5432';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: process.env.DB_HOST,
  port: Number(dbPort),
  dialect: 'postgres',
  logging: false,
});

const db = {
  sequelize,
  Sequelize,
  sourceModel: SourceModel(sequelize),
  fileToDownload: FileToDownload(sequelize),
  startDB: async () => {
    await sequelize.authenticate();
  },
};
export default db;
