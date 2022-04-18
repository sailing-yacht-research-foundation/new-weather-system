import { SourceModel } from './models/entities/SourceModel';

var activeModels: SourceModel[] = [];

const addActiveModel = (data: SourceModel) => {
  activeModels.push(data);
};
const refreshActiveModel = () => {
  activeModels = [];
};
const getActiveModel = () => {
  return [...activeModels];
};

export { addActiveModel, refreshActiveModel, getActiveModel };
