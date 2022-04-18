import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  // CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize';
import {
  ConfigurationTimeStep,
  CsvOrderConfiguration,
} from '../../types/General-type';
import { GeometryPolygon } from '../../types/General-type';

export class SourceModel extends Model<
  InferAttributes<SourceModel>,
  InferCreationAttributes<SourceModel>
> {
  declare name: string;
  declare fileFormat: string;
  declare csvOrder: CsvOrderConfiguration;
  declare spatialResolution: number;
  declare spatialResolutionUnits: string;
  declare availabilityUtc: {
    releaseTime: string;
    availableTime: string;
  }[];
  declare timestep: ConfigurationTimeStep | null;
  declare fileUrl: string;
  declare helpUrl: string | null;
  declare spatialBoundary: GeometryPolygon | null;
  declare paramList: { [key: string]: string }[] | null;
  declare levels: string[];
  declare variables: string[];
}
export default (sequelize: Sequelize) => {
  return SourceModel.init(
    {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      fileFormat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      csvOrder: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      spatialResolution: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      spatialResolutionUnits: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      availabilityUtc: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
      },
      timestep: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      helpUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paramList: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      },
      spatialBoundary: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: true,
      },
      levels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      variables: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'SourceModels',
    },
  );
};
