const LAYER_NAMES = [
    `v:system.all`,
    `v:sensor.sensordata_without_correction`, // Calypso stations
    `chemicals.boreholes_time_series_without_chemicals`, // Raster layer with all boreholes
];

const WATER_LEVEL_KEY = `99999`;

const SELECT_CHEMICAL_DIALOG_PREFIX = `watsonc-select-chemical-dialog`;

const TEXT_FIELD_DIALOG_PREFIX = `watsonc-text-field-dialog`;

const LIMIT_CHAR = `<`;

const VIEW_MATRIX = 0;
const VIEW_ROW = 1;

export { LAYER_NAMES, WATER_LEVEL_KEY, SELECT_CHEMICAL_DIALOG_PREFIX, TEXT_FIELD_DIALOG_PREFIX, LIMIT_CHAR, VIEW_MATRIX, VIEW_ROW };