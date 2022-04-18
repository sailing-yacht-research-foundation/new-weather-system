import db from '..';

import { InferCreationAttributes, Transaction } from 'sequelize/types';
import { SourceModel } from '../entities/SourceModel';

const findByName = async (name: string) => {
  const model = await db.sourceModel.findByPk(name);
  return model;
};

const insert = async (
  data: InferCreationAttributes<SourceModel>,
  options?: { transaction: Transaction },
) => {
  const result = await db.sourceModel.create(data, options);
  return result;
};

export default { insert, findByName };
