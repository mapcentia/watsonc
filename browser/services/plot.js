import { axiosInstance } from './axios';

function getPlotData(key) {
    let rel = key.split(":")[1].startsWith("_") ? "chemicals.boreholes_time_series_with_chemicals" : "sensor.sensordata_with_correction";
    return axiosInstance.get(`/api/sql/jupiter?srs=25832&q=SELECT * FROM ${rel} WHERE boreholeno='${key.split(':')[0]}'`);
}

module.exports = {
    getPlotData
}
