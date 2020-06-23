import moment from 'moment';
import {LIMIT_CHAR} from './constants';

const evaluate = (json, limits, chem, specificIntake = false) => {
    let maxMeasurement = 0;
    let maxMeasurementIntakes = [];
    let latestMeasurement = 0;
    let latestMeasurementIntakes = [];

    // Find latest value
    let intakes = json.timeOfMeasurement.length;
    let currentValue;
    let latestValue = moment("0001-01-01T00:00:00+00:00", "YYYY-MM-DDTHH:mm:ssZZ");
    let latestPosition = {};

    let latestValuesForIntakes = [];

    const generateLatestMeasurement = (intake) => {
        let length = json.timeOfMeasurement[intake].length;

        latestMeasurementIntakes[intake] = false;
        for (let i = length; i--; i >= 0) {
            let detectionLimitReached = true;
            if (json.attributes && json.attributes[intake] && Array.isArray(json.attributes[intake]) && json.attributes[intake][i] === LIMIT_CHAR) {
                detectionLimitReached = false;
            }

            if (detectionLimitReached) {
                currentValue = moment(json.timeOfMeasurement[intake][i], "YYYY-MM-DDTHH:mm:ssZZ");
                latestMeasurement = json.measurements[intake][i];
                latestValuesForIntakes.push(latestMeasurement);
                if (currentValue.isAfter(latestValue)) {
                    latestValue = currentValue;
                    latestPosition = {
                        intake,
                        measurement: i
                    }
                }

                latestMeasurementIntakes[intake] = json.measurements[intake][i];
                break;
            }
        }
    }

    if (specificIntake !== false) {
        generateLatestMeasurement(specificIntake);
    } else {
        for (let i = 0; i < intakes; i++) {
            generateLatestMeasurement(i);
        }
    }

    // Find Highest value
    let numberOfIntakes = json.measurements.length;
    maxMeasurement = 0;
    maxMeasurementIntakes = [];
    let countMeasurements = 0;
    const generateMaxMeasurement = (intake) => {
        maxMeasurementIntakes[intake] = false;
        let length = json.measurements[intake].length;
        for (let u = 0; u < length; u++) {
            countMeasurements++;
            let detectionLimitReached = true;
            if (json.attributes && json.attributes[intake] && Array.isArray(json.attributes[intake]) && json.attributes[intake][u] === LIMIT_CHAR) {
                detectionLimitReached = false;
            }
            if (detectionLimitReached) {
                currentValue = json.measurements[intake][u];
                if (currentValue > maxMeasurementIntakes[intake] || maxMeasurementIntakes[intake] === false) {
                    maxMeasurementIntakes[intake] = currentValue;
                    maxMeasurement = currentValue;
                }
            }
        }
    }

    if (specificIntake !== false) {
        generateMaxMeasurement(specificIntake);
    } else {
        for (let i = 0; i < numberOfIntakes; i++) {
            generateMaxMeasurement(i);
        }
    }

    const green = "rgb(16, 174, 140)";
    const yellow = "rgb(247, 168, 77)";
    const red = "rgb(252, 60, 60)";
    const white = "rgb(220, 220, 220)";

    let chemicalLimits = (limits[chem] ? limits[chem]: [0, 0]);

    let maxColor, latestColor;

    if (latestValuesForIntakes.length > 0) {
        latestMeasurement = Math.max(...latestValuesForIntakes);
    }

    if (chem === "_watlevmsl") {
        maxColor = maxMeasurement === 0 ? white : "#00aaff";
        latestColor = "#00aaff";
    } else {
        maxColor = maxMeasurement === 0 ? white : maxMeasurement <= parseFloat(chemicalLimits[0]) ? green : maxMeasurement > parseFloat(chemicalLimits[0]) && maxMeasurement <= parseFloat(chemicalLimits[1]) ? yellow : red;
        latestColor = latestMeasurement <= parseFloat(chemicalLimits[0]) ? green : latestMeasurement > parseFloat(chemicalLimits[0]) && latestMeasurement <= parseFloat(chemicalLimits[1]) ? yellow : red;
    }

    // Always set max to white if there is only one measurement
    if (countMeasurements === 1) {
        maxColor = white;
    }

    return {
        numberOfIntakes,
        latestMeasurementIntakes,
        maxMeasurementIntakes,
        maxColor,
        latestColor,
        latestMeasurement,
        maxMeasurement,
        chemicalLimits
    };
};

module.exports = evaluate;
