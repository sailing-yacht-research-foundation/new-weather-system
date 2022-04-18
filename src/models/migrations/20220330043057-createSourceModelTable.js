'use strict';

const tableName = 'SourceModels';

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
            name: {
              type: Sequelize.DataTypes.STRING,
              primaryKey: true,
            },
            fileFormat: {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
            },
            csvOrder: {
              type: Sequelize.DataTypes.JSON,
              allowNull: false,
            },
            spatialResolution: {
              type: Sequelize.DataTypes.DOUBLE,
              allowNull: false,
            },
            spatialResolutionUnits: {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
            },
            availabilityUtc: {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.JSON),
              allowNull: false,
            },
            timestep: {
              type: Sequelize.DataTypes.JSON,
              allowNull: true,
            },
            fileUrl: {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
            },
            fileList: {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
              allowNull: true,
            },
            helpUrl: {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            paramList: {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.JSON),
              allowNull: true,
            },
            spatialBoundary: {
              type: Sequelize.DataTypes.GEOMETRY('POLYGON', 4326),
              allowNull: true,
            },
            levels: {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
              allowNull: false,
            },
            variables: {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
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
