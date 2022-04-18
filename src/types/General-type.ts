export type GeometryPolygon = {
  crs: {
    type: 'name';
    properties: { name: 'EPSG:4326' };
  };
  type: 'Polygon';
  coordinates: number[][][];
};

export type ConfigurationTimeStep = {
  resolution: number;
  beginning: number;
  milliseconds: number;
  padding: number;
  max: number;
};

export type CsvOrderConfiguration = {
  level: number;
  lon: number;
  lat: number;
  variable: number;
  date: number;
  value: number;
};

export type ConfigurationFileContent = {
  name: string;
  file_format: string;
  csv_order: CsvOrderConfiguration;
  spatial_resolution: number;
  spatial_resolution_units: string;
  availability_utc: { release_time: string; available_time: string }[];
  timestep?: ConfigurationTimeStep;
  file_url: string;
  help_url?: string;
};
