'use strict';

const tableName = 'FileToDownloads';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      let tableInfo;
      try {
        tableInfo = await queryInterface.describeTable(tableName);
      } catch (err) {
        tableInfo = null;
      }

      if (!tableInfo) {
        await queryInterface.createTable(
          tableName,
          {
            id: {
              type: Sequelize.DataTypes.UUID,
              defaultValue: Sequelize.DataTypes.UUIDV1,
              primaryKey: true,
            },
            modelName: {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
            },
            downloadUrl: {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
            },
            createdAt: {
              type: Sequelize.DataTypes.DATE,
            },
            updatedAt: {
              type: Sequelize.DataTypes.DATE,
            },
          },
          {
            transaction,
          },
        );
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(tableName);
  },
};
