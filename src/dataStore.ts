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
const getModel = (modelName: string) => {
  return activeModels.find((row) => row.name === modelName);
};

export { addActiveModel, refreshActiveModel, getActiveModel, getModel };
