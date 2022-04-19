import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize';

export class DownloadQueue extends Model<
  InferAttributes<DownloadQueue>,
  InferCreationAttributes<DownloadQueue>
> {
  declare id: CreationOptional<string>;
  declare modelName: string;
  declare downloadUrl: string;
}
export default (sequelize: Sequelize) => {
  return DownloadQueue.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
      },
      modelName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      downloadUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'DownloadQueues',
    },
  );
};
