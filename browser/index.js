'use strict';

import BoreholePanelComponent from './components/BoreholePanelComponent';
import BoreholePlotsComponent from './components/BoreholePlotsComponent';

const MODULE_NAME = `watsonc`;

/**
 * The boring hole dialog
 */
const CONTAINER_ID = 'watsonc-features-dialog';
const FORM_CONTAINER_ID = 'watsonc-features-dialog-form';

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

/**
 *
 * @type {*|exports|module.exports}
 */
var switchLayer;

/**
 *
 * @type {*|exports|module.exports}
 */
var backboneEvents;

/**
 *
 * @type {*|exports|module.exports}
 */
var utils, layerTree, layers, state;

var React = require('react');

var ReactDOM = require('react-dom');

let exId = "watsonc";

const LAYER_NAMES = [`v:chemicals.boreholes_time_series_with_chemicals`, `v:chemicals.boreholes_time_series_without_chemicals`];

const TIME_MEASUREMENTS_FIELD = `timeofmeas`;

let boreholePlotsComponentInstance = false;

let boreholePanelComponentInstance = false;

let _self = false;

let dataSource = [];

let store;

var jquery = require('jquery');
require('snackbarjs');

/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */
module.exports = module.exports = {
    set: function (o) {
        cloud = o.cloud;
        switchLayer = o.switchLayer;
        backboneEvents = o.backboneEvents;
        layers = o.layers;
        layerTree = o.layerTree;
        state = o.state;
        utils = o.utils;
        _self = this;
        return this;
    },
    init: function () {

        switchLayer.init("chemicals.boreholes_time_series_without_chemicals", true, true, false);

        backboneEvents.get().on(`startLoading:layers`, layerKey => {
            if (cloud.get().getZoom() < 15 && layerKey === "v:chemicals.boreholes_time_series_with_chemicals") {
                switchLayer.init("v:chemicals.boreholes_time_series_with_chemicals", false, true, false);

                setTimeout(()=>{
                    let applicationWideControls = $(`*[data-gc2-id="chemicals.boreholes_time_series_with_chemicals"]`);
                    applicationWideControls.prop('checked', false);
                }, 200);
            }

        });

        cloud.get().on(`moveend`, () => {
            if (cloud.get().getZoom() < 15) {
                switchLayer.init("v:chemicals.boreholes_time_series_with_chemicals", false, true, false);
                jquery.snackbar({
                    id: "snackbar-watsonc",
                    content: "<span id='conflict-progress'>" + __("Zoom tættere på for at aktivere data-funktionerne.") + "</span>",
                    htmlAllowed: true,
                    timeout: 1000000
                });

            } else {
                if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[0]) === -1) {
                    switchLayer.init("v:chemicals.boreholes_time_series_with_chemicals", true, true, false);
                }
                setTimeout(function () {
                    jquery("#snackbar-watsonc").snackbar("hide");
                }, 200);
            }
        }); 

        $.ajax({
            url: '/api/sql/jupiter?q=SELECT * FROM codes.compunds',
            scriptCharset: "utf-8",
            success: function (response) {
                if (`features` in response) {
                    let menuObj = {};
                    let limits = {};
                    let count = 0;

                    response.features.map(function (v) {
                        menuObj[v.properties.kategori] = {};
                    });

                    for (var key in menuObj) {
                        response.features.map(function (v) {
                            if (key === v.properties.kategori) {
                                menuObj[key][v.properties.compundno] = v.properties.navn;
                                limits["_" + v.properties.compundno] = [v.properties.attention || 0, v.properties.limit || 0];
                            }
                        });
                    }
                    for (let key in menuObj) {
                        if (menuObj.hasOwnProperty(key)) {
                            let group = `<div class="panel panel-default panel-layertree" id="layer-panel-${count}">
                                            <div class="panel-heading" role="tab">
                                                <h4 class="panel-title">
                                                    <!--<div class="layer-count badge">-->
                                                        <!--<span>0</span> / <span></span>-->
                                                    <!--</div>-->
                                                    <a style="display: block" class="accordion-toggle" data-toggle="collapse" data-parent="#watsonc-layers" href="#collapse${count}">${key}</a>
                                                </h4>
                                            </div>
                                            <ul class="list-group" id="group-${count}" role="tabpanel"></ul>
                                        </div>`;
                            $(`#watsonc-layers`).append(group);
                            $(`#group-${count}`).append(`<div id="collapse${count}" class="accordion-body collapse"></div>`);
                            for (let key2 in menuObj[key]) {
                                if (menuObj[key].hasOwnProperty(key2)) {

                                    let layer = `<li class="layer-item list-group-item" style="min-height: 40px; margin-top: 10px; border-bottom: 1px solid #CCC; background-color: white;">
                                                    <div>
                                                        <div style="display: inline-block;">
                                                            <label><input data-chem="${key2}" name="chem" type="radio"/>&nbsp;${menuObj[key][key2]}</label>
                                                        </div>
                                                    </div>`;
                                    $(`#collapse${count}`).append(layer);
                                }
                            }
                            count++;
                        }
                    }

                    $("[data-chem]").change(
                        function (e) {
                            let chem = "_" + $(e.target).data("chem");
                            store = layerTree.getStores()["v:chemicals.boreholes_time_series_with_chemicals"];

                            let fn = function (layer) {
                                store.layer.eachLayer(function (layer) {
                                    let feature = layer.feature;
                                    let maxColor;
                                    let latestColor;
                                    let iconSize;
                                    let iconAnchor;
                                    let maxMeasurement = 0;
                                    let latestMeasurement = 0;
                                    let json;

                                    try {
                                        json = JSON.parse(feature.properties[chem]);
                                    } catch (e) {
                                        return L.circleMarker(layer.getLatLng());
                                    }

                                    if (feature.properties[chem] !== null) {
                                        let unit = json.unit;
                                        // Find latest value
                                        let intakes = json.timeOfMeasurement.length;
                                        let currentValue;
                                        let latestValue = moment("0001-01-01T00:00:00+00:00", "YYYY-MM-DDTHH:mm:ssZZ");
                                        let latestPosition = {};

                                        for (let i = 0; i < intakes; i++) {
                                            let length = json.timeOfMeasurement[i].length - 1;
                                            currentValue = moment(json.timeOfMeasurement[i][length], "YYYY-MM-DDTHH:mm:ssZZ");
                                            if (currentValue.isAfter(latestValue)) {
                                                latestValue = currentValue;
                                                latestMeasurement = json.measurements[i][length];
                                                latestPosition = {
                                                    intake: i,
                                                    measurement: length
                                                }
                                            }
                                        }

                                        // Find Highest value
                                        intakes = json.measurements.length;
                                        maxMeasurement = 0;

                                        for (let i = 0; i < intakes; i++) {
                                            let length = json.measurements[i].length;
                                            for (let u = 0; u < length; u++) {
                                                currentValue = json.measurements[i][u];
                                                if (!(latestPosition.intake === i && latestPosition.measurement === u) && currentValue > maxMeasurement) {
                                                    maxMeasurement = currentValue;
                                                }
                                            }
                                        }

                                        layer.bindTooltip(`
                                        <p>${chem} (${unit})</p>
                                        <p>Max: ${maxMeasurement}</p>
                                        <p>Seneste: ${latestMeasurement}</p>
                                    `);

                                        if (chem === "_watlevmsl") {
                                            maxColor = maxMeasurement === 0 ? "#ffffff" : "#00aaff";
                                            latestColor = "#00aaff";
                                        } else {
                                            maxColor = maxMeasurement === 0 ? "#ffffff" : maxMeasurement <= limits[chem][0] ? "#00ff00" : maxMeasurement > limits[chem][0] && maxMeasurement <= limits[chem][1] ? "#ffff00" : "#ff0000";
                                            latestColor = latestMeasurement <= limits[chem][0] ? "#00ff00" : latestMeasurement > limits[chem][0] && latestMeasurement <= limits[chem][1] ? "#ffff00" : "#ff0000";
                                        }
                                        iconSize = [30, 30];
                                        iconAnchor = [15, 15];
                                        layer.setZIndexOffset(10000);

                                    } else {
                                        maxColor = latestColor = "#cccccc";
                                        iconSize = [20, 20];
                                        iconAnchor = [10, 10];
                                        layer.setZIndexOffset(1);

                                    }

                                    var svg = `<svg
                                    xmlns:dc="http://purl.org/dc/elements/1.1/"
                                    xmlns:cc="http://creativecommons.org/ns#"
                                    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                                    xmlns:svg="http://www.w3.org/2000/svg"
                                    xmlns="http://www.w3.org/2000/svg"
                                    id="svg8"
                                    version="1.1"
                                    viewBox="0 0 84.688354 84.688354"
                                    height="84.688354"
                                    width="84.688354">
                                    <defs
                                        id="defs2" />
                                    <g
                                        transform="translate(-61.786713,-90.408127)"
                                        id="layer1">
                                        <path
                                        style=";stroke-width:0.26458332;stroke:#000000;stroke-opacity:1;fill:${maxColor};stroke-width:0.26458332"
                                        d="m 104.13089,175.09648 a 42.344177,42.344177 0 0 1 -36.671133,-21.17209 42.344177,42.344177 0 0 1 0,-42.34417 42.344177,42.344177 0 0 1 36.671133,-21.172093 l 0,42.344173 z"
                                        id="path3729" />
                                        <path
                                        transform="scale(-1,1)"
                                        style=";stroke-width:0.26458332;stroke:#000000;stroke-opacity:1;fill:${latestColor};stroke-width:0.26458332"
                                        d="m -104.13089,175.09648 a 42.344177,42.344177 0 0 1 -36.67113,-21.17209 42.344177,42.344177 0 0 1 0,-42.34417 42.344177,42.344177 0 0 1 36.67113,-21.172093 l 0,42.344173 z"
                                        id="path3729-3" />
                                    </g>
                                </svg>`;

                                    let iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);
                                    let icon = L.icon({
                                        iconUrl: iconUrl,
                                        iconSize: iconSize,
                                        iconAnchor: iconAnchor,
                                        popupAnchor: iconAnchor,
                                    });

                                    layer.setIcon(icon);


                                })

                            };
                            layerTree.setOnLoad("v:chemicals.boreholes_time_series_with_chemicals", fn, "watsonc");

                            //store.layer.eachLayer(fn);

                            //if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[0]) === -1) {
                            switchLayer.init("v:chemicals.boreholes_time_series_with_chemicals", true, true, false)
                            //}

                        }
                    );

                    // Setup menu
                    let dd = $('li .dropdown-toggle');
                    let navLi = $(".dropdown-top");

                    dd.on('click', function (event) {
                        $(".dropdown-top").not($(this).parent()).removeClass('open');
                        $('.dropdown-submenu').removeClass('open');
                        $(this).parent().toggleClass('open');
                    });
                    //
                    // navLi.on('click', function () {
                    //     navLi.removeClass('open');
                    //     $(this).addClass('open');
                    // });
                } else {
                    console.error(`Unable to request codes.compunds`);
                }
            },
            error: function (response) {
            }
        });

        state.listenTo(MODULE_NAME, _self);
        state.listen(MODULE_NAME, `plotsUpdate`);

        utils.createMainTab(exId, __("Plot"), __("Info"), require('./../../../browser/modules/height')().max, "check_circle");






        const announcePlotsChange = (plots = false) => {
            backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);

            if (plots) {
                // Plots were updated from the BoreholePlotsComponent component

                if (boreholePanelComponentInstance) {
                    console.log(`### setting new plots`, plots);

                    boreholePanelComponentInstance.setPlots(plots);
                }
            }



            /*

            let existingPlots = [];
            let plotsToProcess = ((plots) ? plots : _self.getExistingPlots());
            plotsToProcess.map(plot => {
                let removeButtons = ``;
                plot.measurements.map(measurement => {
                    let measurementDisplayTitle = measurement;
                    let splitMeasurementId = measurement.split(':');
                    let gid = parseInt(splitMeasurementId[0]);
                    if (dataSource.length > 0) {
                        dataSource.map(item => {
                            if (item.properties.gid === gid) {
                                measurementDisplayTitle = (`${item.properties.boreholeno}, ${JSON.parse(item.properties[splitMeasurementId[1]]).title} (#${ (parseInt(splitMeasurementId[2]) + 1) })`);
                                return false;
                            }
                        });
                    }

                    removeButtons = removeButtons + `<button
                        type="button"
                        class="btn btn-xs btn-primary js-delete-measurement"
                        data-plot-id="${plot.id}"
                        data-gid="${gid}"
                        data-key="${splitMeasurementId[1]}"
                        data-intake-index="${splitMeasurementId[2]}"
                        style="padding: 4px; margin: 1px;">
                        <i class="fa fa-remove"></i> ${measurementDisplayTitle}
                    </button>`;
                });

                existingPlots.push(`<div
                    class="well well-sm js-plot"
                    data-id="${plot.id}"
                    style="margin-bottom: 4px;">
                    <span>${plot.title}</span>
                    <span>${removeButtons}</span>
                </div>`);
            });

            $(`.watsonc-custom-popup`).find(`.js-existing-plots-container`).empty();
            setTimeout(() => {
                $(`.watsonc-custom-popup`).find(`.js-plot`).droppable({
                    drop: function (event, ui) {
                        boreholePlotsComponentInstance.addMeasurement($(this).data(`id`),
                            $(ui.draggable[0]).data(`gid`), $(ui.draggable[0]).data(`key`), $(ui.draggable[0]).data(`intake-index`));
                    }
                });

                $(`.watsonc-custom-popup`).find(`.js-delete-measurement`).click((event) => {
                    boreholePlotsComponentInstance.deleteMeasurement($(event.currentTarget).data(`plot-id`),
                        $(event.currentTarget).data(`gid`), $(event.currentTarget).data(`key`), $(event.currentTarget).data(`intake-index`));
                });
            }, 100);
*/
            
        };



        backboneEvents.get().on("doneLoading:layers", e => {
            if (e === LAYER_NAMES[0]) {
                dataSource = layers.getMapLayers(false, LAYER_NAMES[0])[0].toGeoJSON().features;
                if (boreholePlotsComponentInstance) {
                    boreholePlotsComponentInstance.setDataSource(dataSource);
                }
            }
        });

        state.getState().then(applicationState => {
            LAYER_NAMES.map(function (layerName) {
                layerTree.setOnEachFeature(layerName, function (feature, layer) {
                    layer.on("click", function (e) {
                        $("#" + CONTAINER_ID).animate({
                            bottom: "0"
                        }, 500, function () {
                            $(".expand-less").show();
                            $(".expand-more").hide();
                        });

                        $("#" + CONTAINER_ID).find(`.modal-title`).html(`${__(`Borehole`)} no. ${feature.properties.boreholeno}`);
                        if (document.getElementById(FORM_CONTAINER_ID)) {
                            try {
                                let existingPlots = boreholePlotsComponentInstance.getPlots();

                                boreholePanelComponentInstance = ReactDOM.render(<BoreholePanelComponent
                                    feature={feature}
                                    dataSource={dataSource}
                                    initialPlots={(existingPlots ? existingPlots : [])}
                                    onAddMeasurement={(plotId, featureGid, featureKey, featureIntakeIndex) => {
                                        boreholePlotsComponentInstance.addMeasurement(plotId, featureGid, featureKey, featureIntakeIndex);
                                    }}
                                    onPlotAdd={((newPlotTitle) => {
                                        boreholePlotsComponentInstance.addPlot(newPlotTitle);
                                    })}/>, document.getElementById(FORM_CONTAINER_ID));
                            } catch (e) {
                                console.log(e);
                            }
                        } else {
                            console.warn(`Unable to find the container for borehole component (element id: ${FORM_CONTAINER_ID})`);
                        }

                        if (!boreholePlotsComponentInstance) {
                            throw new Error(`Unable to find the component instance`);
                        }
                    });
                }, "watsonc");

                layerTree.setStyle(layerName, {
                    weight: 5,
                    color: '#ff0000',
                    dashArray: '',
                    fillOpacity: 0.2
                });

                // layerTree.setPointToLayer(layerName, (feature, latlng) => {
                //     return L.circleMarker(latlng);
                // });
            });

            // Renewing the already created store by rebuilding the layer tree
            layerTree.create(false, true).then(() => {
                // Reloading (applying updated store settings) layers that need it
                layerTree.getActiveLayers().map(activeLayerKey => {
                    if (LAYER_NAMES.indexOf(activeLayerKey) !== -1) {
                        layerTree.reloadLayer(activeLayerKey);
                    }
                });
            });

            if (document.getElementById(exId)) {
                let initialPlots = [];
                if (applicationState && `modules` in applicationState && MODULE_NAME in applicationState.modules && `plots` in applicationState.modules[MODULE_NAME]) {
                    initialPlots = applicationState.modules[MODULE_NAME].plots;
                }

                try {
                    boreholePlotsComponentInstance = ReactDOM.render(<BoreholePlotsComponent
                        initialPlots={initialPlots}
                        onPlotsChange={announcePlotsChange}/>, document.getElementById(exId));
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.warn(`Unable to find the container for watsonc extension (element id: ${exId})`);
            }
        });

        $(`#` + CONTAINER_ID).find(".expand-less").on("click", function () {
            $("#" + CONTAINER_ID).animate({
                bottom: (($("#" + CONTAINER_ID).height() * -1) + 30) + "px"
            }, 500, function () {
                $(`#` + CONTAINER_ID).find(".expand-less").hide();
                $(`#` + CONTAINER_ID).find(".expand-more").show();
            });
        });

        $(`#` + CONTAINER_ID).find(".expand-more").on("click", function () {
            $("#" + CONTAINER_ID).animate({
                bottom: "0"
            }, 500, function () {
                $(`#` + CONTAINER_ID).find(".expand-less").show();
                $(`#` + CONTAINER_ID).find(".expand-more").hide();
            });
        });

        $(`#` + CONTAINER_ID).find(".close-hide").on("click", function () {
            $("#" + CONTAINER_ID).animate({
                bottom: "-100%"
            }, 500, function () {
                $(`#` + CONTAINER_ID).find(".expand-less").show();
                $(`#` + CONTAINER_ID).find(".expand-more").hide();
            });
        });
    },

    /**
     * Returns current module state
     */
    getState: () => {
        return {plots: _self.getExistingPlots()};
    },

    /**
     * Applies externally provided state
     */
    applyState: (newState) => {
        return new Promise((resolve, reject) => {
            if (newState && `plots` in newState && newState.plots.length > 0) {
                boreholePlotsComponentInstance.setPlots(newState.plots);
            }

            resolve();
        });
    },

    getExistingPlots: () => {
        if (boreholePlotsComponentInstance) {
            return boreholePlotsComponentInstance.getPlots();
        } else {
            throw new Error(`Unable to find the component instance`);
        }
    }
};



