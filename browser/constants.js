const LAYER_NAMES = [
    `v:system.all`, // 0
    `v:sensor.sensordata_without_correction`, // 1 Calypso stations
    `chemicals.boreholes_time_series_without_chemicals`, // 2 Raster layer with all boreholes
    `v:analyser.pesticidoverblik`, // 3
    `analyser.pesticidoverblik_raster` // 4
];

const WATER_LEVEL_KEY = `99999`;

const SELECT_CHEMICAL_DIALOG_PREFIX = `watsonc-select-chemical-dialog`;

const TEXT_FIELD_DIALOG_PREFIX = `watsonc-text-field-dialog`;

const LIMIT_CHAR = `<`;

const VIEW_MATRIX = 0;
const VIEW_ROW = 1;

const FREE_PLAN_MAX_TIME_SERIES_COUNT = 4;
const FREE_PLAN_MAX_PROFILES_COUNT = 1;

export { LAYER_NAMES, WATER_LEVEL_KEY, SELECT_CHEMICAL_DIALOG_PREFIX, TEXT_FIELD_DIALOG_PREFIX, LIMIT_CHAR, VIEW_MATRIX, VIEW_ROW, FREE_PLAN_MAX_TIME_SERIES_COUNT, FREE_PLAN_MAX_PROFILES_COUNT };
