/**
 * Extracts the chemical name from existing categories
 *
 * @param {String} chemicalId Chemical identifier
 * @param {Array}  categories Existing categories
 *
 * @returns {String}
 */
const getChemicalName = (chemicalId, categories) => {
    let chemicalName = false;
    for (let layerName in categories) {
        for (let groupName in categories[layerName]) {
            for (let key in categories[layerName][groupName]) {
                if ((key + '') === (chemicalId + '')) {
                    chemicalName = categories[layerName][groupName][key];
                }
            }
        }
    }

    if (chemicalId === `watlevmsl`) {
        chemicalName = __(`Water level`);
    }

    if (chemicalName === false) {
        console.error (`Unable to detect the chemical name for identifier ${chemicalId}`);
    }

    return chemicalName;
};

/**
 * Detects the measurement title
 *
 * @param {Object} measurement Measurement object
 *
 * @returns {String}
 */
const getMeasurementTitle = (measurement) => {
    let title = measurement.properties.boreholeno;
    if (`watlevmsl` in measurement.properties && measurement.properties.loctypeid && measurement.properties.loctypeid > 0) {
        let parsedData = JSON.parse(measurement.properties.watlevmsl);
        if (parsedData.boreholeno) {
            title = parsedData.boreholeno;
        }
    }

    return title;
};

const getLogo = () => {
    let svg = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         viewBox="0 0 321.2 93" style="enable-background:new 0 0 321.2 93; height: 40px;" xml:space="preserve">
                        <style type="text/css">
                            .st0{fill:#A0E0C5;}
                            .st1{fill:#FFFFFF;}
                        </style>
                        <g>
                            <g>
                                <path class="st0" d="M274.9,17.3c5.9,1.2,11,5.5,13.2,11c1.3,3.2,1.8,6.9,4.3,9.2c2,1.8,4.9,2.3,7.5,1.6c2.6-0.7,4.8-2.5,6.3-4.7
                                    c3.6-5.2,3.2-12.5,0-17.9c-3.2-5.4-9-9-15.2-10.6c-10.1-2.5-21.5,0.5-28.6,8.2c-1.4,1.5-2.6,3.2-3.6,5c-0.6,1,0.6,2.2,1.6,1.6
                                    C264.5,18.4,270.5,16.4,274.9,17.3"/>
                                <path class="st1" d="M313.6,54.9c-4.3-5.9-11.3-5.4-17.1-3.4c-4.4,1.5-8.5,3.8-13,4.7c-10.2,2.1-21.3-3.8-25.8-13.2
                                    c-2.3-4.8-2.9-10.4-1.9-15.6c0.2-1.2-1.3-1.9-2.1-1c-6.7,8.3-9.9,19.4-8.2,30c2.2,13.3,12.1,25.1,24.8,29.5
                                    c12.7,4.4,27.8,1.3,37.7-7.8c4.7-4.3,8.4-10.2,7.9-16.9C315.7,59,314.9,56.8,313.6,54.9"/>
                            </g>
                            <g>
                                <path class="st1" d="M12.4,55.7c0,6.6,2.7,11.6,9.5,11.6c3.2,0,6.5-1.5,8.8-4.5c0.2-0.4,0.7-0.6,1.2-0.6c0.2,0,0.5,0.1,0.7,0.2
                                    l3.1,1.9c0.4,0.3,0.6,0.7,0.6,1.2c0,0.3-0.1,0.6-0.2,0.8c-2.7,4.7-7.7,7.5-14.2,7.5c-10.5,0-16.6-7.5-16.6-18
                                    c0-10.6,6.1-18.5,16.6-18.5c6.5,0,11.6,2.9,14.3,7.5c0.2,0.2,0.2,0.5,0.2,0.8c0,0.5-0.2,0.9-0.6,1.2l-3,1.9
                                    c-0.2,0.1-0.5,0.2-0.7,0.2c-0.6,0-1-0.2-1.2-0.6c-2.2-3-5.5-4.5-8.8-4.5C15.1,43.6,12.4,49.3,12.4,55.7z"/>
                                <path class="st1" d="M57.5,37.8c0.7,0,1.4,0.6,1.7,1.4l9.5,32.5c0,0.8-0.7,1.4-1.4,1.4h-4.2c-0.7,0-1.4-0.6-1.6-1.4l-1-4.1H46.9
                                    l-1.1,4.1c-0.2,0.7-0.9,1.4-1.6,1.4H40c-0.7,0-1.4-0.6-1.4-1.4l9.5-32.5c0.2-0.8,0.9-1.4,1.7-1.4H57.5z M58.4,61.3l-4.7-16.5
                                    l-4.8,16.5H58.4z"/>
                                <path class="st1" d="M74.6,39.2c0-0.4,0.2-0.8,0.5-1.1c0.2-0.2,0.6-0.4,0.9-0.4h4.3c0.4,0,0.8,0.1,1.1,0.4c0.2,0.2,0.4,0.6,0.4,1
                                    v27.2h14.4c0.4,0,0.8,0.2,1.1,0.5c0.2,0.2,0.3,0.6,0.3,0.9v4c0,0.4-0.1,0.7-0.4,0.9c-0.2,0.2-0.6,0.4-1,0.4H76
                                    c-0.4,0-0.8-0.2-1.1-0.4c-0.2-0.2-0.4-0.6-0.4-1V39.2z"/>
                                <path class="st1" d="M110.6,53l6.8-13.8c0.4-0.7,1.1-1.4,1.8-1.4h4.7c0.7,0,1.4,0.6,1.4,1.4L114.1,62v9.8c0,0.8-0.7,1.4-1.4,1.4
                                    h-4.3c-0.7,0-1.4-0.6-1.4-1.4V62L95.7,39.2c0-0.8,0.7-1.4,1.4-1.4h4.7c0.7,0,1.4,0.7,1.8,1.4L110.6,53z"/>
                                <path class="st1" d="M141.1,37.8c10.5,0,15.2,6.2,15.2,12.9v0.5c0,6.7-4.7,13.1-15.2,13.1h-4.9v7.3c0,0.8-0.7,1.4-1.4,1.4h-4.3
                                    c-0.7,0-1.4-0.6-1.4-1.4V39.2c0-0.8,0.7-1.4,1.4-1.4H141.1z M136.3,44.1v13.7h4.9c7,0,8-3.3,8-6.6v-0.5c0-3.4-1.1-6.7-8-6.7H136.3
                                    z"/>
                                <path class="st1" d="M184.5,47.6h-4c-0.7,0-1.6-0.7-1.9-1.5c-1.2-2.4-3.8-2.6-7-2.6c-3.7,0-5.7,1.4-5.7,3.7
                                    c0,5.5,21.2,4.5,21.2,15.6c0,8.5-6,11.1-13.9,11.1c-7.5,0-13.5-2.9-14.2-8.9c0-0.8,0.6-1.7,1.6-1.7h4c0.7,0,1.6,0.6,1.9,1.4
                                    c1,2.3,4.2,2.9,6.8,2.9c3.2,0,6.8,0,6.8-4.3c0-6.1-21.2-4-21.2-15.9c0-6.2,4.9-10.1,12.8-10.1c7.7,0,13.7,2.8,14.5,8.7
                                    C186.1,46.7,185.5,47.6,184.5,47.6z"/>
                                <path class="st1" d="M190.2,55.7c0-10.6,6.1-18.5,16.5-18.5c10.5,0,16.5,7.9,16.5,18.5c0,10.6-6.1,18-16.5,18
                                    C196.3,73.8,190.2,66.3,190.2,55.7z M216.1,55.7c0-6.5-2.5-12.3-9.4-12.3c-6.8,0-9.4,5.7-9.4,12.3c0,6.7,2.6,11.8,9.4,11.8
                                    C213.6,67.5,216.1,62.4,216.1,55.7z"/>
                            </g>
                        </g>
                    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

module.exports = {
    getChemicalName,
    getMeasurementTitle,
    getLogo
}
