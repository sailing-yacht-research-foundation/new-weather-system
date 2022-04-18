require('dotenv').config();
const path = require('path');
const Umzug = require('umzug');

const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME || 'localhost';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbPort = process.env.DB_PORT || '5432';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: process.env.DB_HOST,
  port: Number(dbPort),
  dialect: 'postgres',
  logging: false,
});

const umzug = new Umzug({
  migrations: {
    params: [
      sequelize.getQueryInterface(),
      Sequelize, // Sequelize constructor - the required module
    ],
    path: path.join(__dirname, 'migrations'),
    pattern: /\.js$/,
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },
  context: sequelize.getQueryInterface(),
  logging: console.log,
});

(async () => {
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  if (process.argv[2] === 'down') {
    await umzug.down();
  } else {
    await umzug.up();
  }
})();
