'use strict';

import {Provider} from 'react-redux';

import PlotManager from './PlotManager';
import ModalComponent from './components/ModalComponent';
import DashboardComponent from './components/DashboardComponent';
import MenuTimeSeriesComponent from './components/MenuTimeSeriesComponent';
import MenuDataSourceAndTypeSelectorComponent from './components/MenuDataSourceAndTypeSelectorComponent';
import MenuProfilesComponent from './components/MenuProfilesComponent';
import IntroModal from './components/IntroModal';
import {LAYER_NAMES, WATER_LEVEL_KEY} from './constants';

import reduxStore from './redux/store';
import {setAuthenticated} from './redux/actions';

const symbolizer = require('./symbolizer');

const utils = require('./utils');

const evaluateMeasurement = require('./evaluateMeasurement');

const MODULE_NAME = `watsonc`;

/**
 * The feature dialog constants
 */
const FEATURE_CONTAINER_ID = 'watsonc-features-dialog';
const FORM_FEATURE_CONTAINER_ID = 'watsonc-features-dialog-form';

/**
 * The plots dialog constants
 */
const DASHBOARD_CONTAINER_ID = 'watsonc-plots-dialog-form';
let PLOTS_ID = `#` + DASHBOARD_CONTAINER_ID;

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud, switchLayer, backboneEvents, session = false;

/**
 *
 * @type {*|exports|module.exports}
 */
var layerTree, layers, anchor, state, urlparser;

var React = require('react');

var ReactDOM = require('react-dom');

let dashboardComponentInstance = false, modalComponentInstance = false, infoModalInstance = false;

let lastSelectedChemical = false, categoriesOverall = false, enabledLoctypeIds = [];

let _self = false;

let lastFeatures = false;

let lastTitleAsLink = null;

let dataSource = [];

let boreholesDataSource = [];
let waterLevelDataSource = [];

let previousZoom = -1;

let store;

let categories = {};
let limits = {};
let names = {};

let currentRasterLayer = null;

const DATA_SOURCES = [{
    originalLayerKey: LAYER_NAMES[0],
    additionalKey: ``,
    title: __(`Jupiter drilling`)
}, {
    originalLayerKey: LAYER_NAMES[1],
    additionalKey: `1`,
    title: __(`CALYPSO stations`)
}, {
    originalLayerKey: LAYER_NAMES[1],
    additionalKey: `3`,
    title: __(`CALYPSO stations`)
}, {
    originalLayerKey: LAYER_NAMES[1],
    additionalKey: `4`,
    title: __(`CALYPSO stations`)
}];

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
        anchor = o.anchor;
        state = o.state;
        urlparser = o.urlparser;
        if (o.extensions && o.extensions.session) {
            session = o.extensions.session.index;
        }

        _self = this;
        return this;
    },

    init: function () {
        state.listenTo(MODULE_NAME, _self);
        state.listen(MODULE_NAME, `plotsUpdate`);
        state.listen(MODULE_NAME, `chemicalChange`);
        state.listen(MODULE_NAME, `enabledLoctypeIdsChange`);

        this.initializeSearchBar();

        let queryParams = new URLSearchParams(window.location.search);
        let licenseToken = queryParams.get('license');
        let license = null;
        if (licenseToken) {
            license = JSON.parse(base64.decode(licenseToken.split('.')[1]));
            if (typeof license === 'object') {
                license = license.license;
                if (license === "premium") {
                    $("#watsonc-licens-btn1").html("Vælg");
                    $("#watsonc-licens-btn1").attr("disabled", true);
                    $("#watsonc-licens-btn2").html("Valgt");
                    $("#watsonc-licens-btn2").attr("disabled", true);

                } else {
                    $("#watsonc-licens-btn1").html("Valgt");
                    $("#watsonc-licens-btn1").attr("disabled", true);
                    $("#watsonc-licens-btn2").html("Vælg");
                }
            }
        }

        $("#btn-plan").on("click", ()=>{
            $('#watsonc-limits-reached-text').hide();
            $('#upgrade-modal').modal('show');
        })

        backboneEvents.get().on(`session:authChange`, authenticated => {
            reduxStore.dispatch(setAuthenticated(authenticated));
        });

        backboneEvents.get().on("ready:meta", function () {
            console.log("Opening panels (Meta event)");
            setTimeout(() => {
                $(".panel-title a").trigger("click");
            }, 1000);

        });

        $('#watsonc-plots-dialog-form').click(function () {
            $('#watsonc-plots-dialog-form').css('z-index', '1000');

            if ($('#watsonc-features-dialog').css('z-index') === '1000') {
                $('#watsonc-features-dialog').css('z-index', '100');
            } else {
                $('#watsonc-features-dialog').css('z-index', '10');
            }

            if ($('#search-ribbon').css('z-index') === '1000') {
                $('#search-ribbon').css('z-index', '100');
            } else {
                $('#search-ribbon').css('z-index', '10');
            }
        });

        $('#watsonc-features-dialog').click(function () {
            _self.bringFeaturesDialogToFront();
        });

        $('#search-ribbon').click(function () {
            if ($('#watsonc-plots-dialog-form').css('z-index') === '1000') {
                $('#watsonc-plots-dialog-form').css('z-index', '100');
            } else {
                $('#watsonc-plots-dialog-form').css('z-index', '10');
            }

            if ($('#watsonc-features-dialog').css('z-index') === '1000') {
                $('#watsonc-features-dialog').css('z-index', '100');
            } else {
                $('#watsonc-features-dialog').css('z-index', '10');
            }

            $('#search-ribbon').css('z-index', '1000');
        });

        var lc = L.control.locate({
            drawCircle: false
        }).addTo(cloud.get().map);

        $(`#search-border`).trigger(`click`);

        $(`#js-open-state-snapshots-panel`).click(() => {
            $(`[href="#state-snapshots-content"]`).trigger(`click`);
        });

        $(`#js-open-watsonc-panel`).click(() => {
            $(`[href="#watsonc-content"]`).trigger(`click`);
        });

        $(".panel-title a").trigger("click");

        // Turn on raster layer with all boreholes.
        switchLayer.init(LAYER_NAMES[2], true, true, false);

        $.ajax({
            url: '/api/sql/jupiter?q=SELECT * FROM codes.compunds_view&base64=false',
            scriptCharset: "utf-8",
            success: function (response) {
                if (`features` in response) {
                    categories = {};
                    limits = {};

                    response.features.map(function (v) {
                        categories[v.properties.kategori.trim()] = {};
                        names[v.properties.compundno] = v.properties.navn;
                    });

                    names[WATER_LEVEL_KEY] = "Vandstand";

                    for (var key in categories) {
                        response.features.map(function (v) {
                            if (key === v.properties.kategori) {
                                categories[key][v.properties.compundno] = v.properties.navn;
                                limits["_" + v.properties.compundno] = [v.properties.attention || 0, v.properties.limit || 0];
                            }
                        });
                    }

                    _self.buildBreadcrumbs();

                    categoriesOverall = {};
                    categoriesOverall[LAYER_NAMES[0]] = categories;
                    categoriesOverall[LAYER_NAMES[0]]["Vandstand"] = {"0": WATER_LEVEL_KEY};
                    categoriesOverall[LAYER_NAMES[1]] = {"Vandstand": {"0": WATER_LEVEL_KEY}};

                    if (infoModalInstance) infoModalInstance.setCategories(categoriesOverall);

                    // Setup menu
                    let dd = $('li .dropdown-toggle');
                    dd.on('click', function (event) {
                        $(".dropdown-top").not($(this).parent()).removeClass('open');
                        $('.dropdown-submenu').removeClass('open');
                        $(this).parent().toggleClass('open');
                    });

                    // Open intro modal only if there is no predefined state
                    if (!urlparser.urlVars || !urlparser.urlVars.state) {
                        _self.openMenuModal(true);
                    } else {
                        _self.openMenuModal(false);
                    }

                    backboneEvents.get().trigger(`${MODULE_NAME}:initialized`);
                } else {
                    console.error(`Unable to request codes.compunds`);
                }
            },
            error: function () {
            }
        });

        state.getState().then(applicationState => {
            $(PLOTS_ID).attr(`style`, `
                margin-bottom: 0px;
                width: 80%;
                max-width: 80%;
                right: 10%;
                left: 10%;
                bottom: 0px;`);

            LAYER_NAMES.map(layerName => {
                layerTree.setOnEachFeature(layerName, (clickedFeature, layer) => {
                    layer.on("click", function (e) {
                        $("#" + FEATURE_CONTAINER_ID).animate({
                            bottom: "0"
                        }, 500, function () {
                            $("#" + FEATURE_CONTAINER_ID).find(".expand-less").show();
                            $("#" + FEATURE_CONTAINER_ID).find(".expand-more").hide();
                        });

                        let intersectingFeatures = [];
                        if (e.latlng) {
                            var clickBounds = L.latLngBounds(e.latlng, e.latlng);
                            let res = [156543.033928, 78271.516964, 39135.758482, 19567.879241, 9783.9396205,
                                4891.96981025, 2445.98490513, 1222.99245256, 611.496226281, 305.748113141, 152.87405657,
                                76.4370282852, 38.2185141426, 19.1092570713, 9.55462853565, 4.77731426782, 2.38865713391,
                                1.19432856696, 0.597164283478, 0.298582141739, 0.149291, 0.074645535];

                            let distance = 10 * res[cloud.get().getZoom()];

                            let mapObj = cloud.get().map;
                            for (var l in mapObj._layers) {
                                var overlay = mapObj._layers[l];
                                if (overlay._layers) {
                                    for (var f in overlay._layers) {
                                        var feature = overlay._layers[f];
                                        var bounds;
                                        if (feature.getBounds) {
                                            bounds = feature.getBounds();
                                        } else if (feature._latlng) {
                                            let circle = new L.circle(feature._latlng, {radius: distance});
                                            // DIRTY HACK
                                            circle.addTo(mapObj);
                                            bounds = circle.getBounds();
                                            circle.removeFrom(mapObj);
                                        }

                                        try {
                                            if (bounds && clickBounds.intersects(bounds) && overlay.id) {
                                                intersectingFeatures.push(feature.feature);
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    }
                                }
                            }
                        } else {
                            // In case marker "click" event was triggered from the code
                            intersectingFeatures.push(e.target.feature);
                        }

                        let titleAsLink = false;

                        if (layerName.indexOf(LAYER_NAMES[0]) > -1) {
                            titleAsLink = true;
                        }

                        let clickedFeatureAlreadyDetected = false;
                        intersectingFeatures.map(feature => {
                            if (feature.properties.boreholeno === clickedFeature.properties.boreholeno) {
                                clickedFeatureAlreadyDetected = true;
                            }
                        });

                        if (clickedFeatureAlreadyDetected === false) intersectingFeatures.unshift(clickedFeature);

                        let boreholes = [];

                        intersectingFeatures.map((feature) => {
                            boreholes.push(feature.properties.boreholeno)
                        });

                        let qLayer;
                        if (layerName.indexOf(LAYER_NAMES[0]) > -1) {
                            qLayer = "chemicals.boreholes_time_series_with_chemicals";
                        } else {
                            qLayer = "sensor.sensordata_with_correction";
                            // Filter NaN values, so SQL doesn't return type error
                            boreholes = boreholes.filter((v) => {
                                if (!isNaN(v)) {
                                    return v;
                                }
                            });
                        }

                        // Lazy load features
                        $.ajax({
                            url: "/api/sql/jupiter?srs=25832&q=SELECT * FROM " + qLayer + " WHERE boreholeno in('" + boreholes.join("','") + "')",
                            scriptCharset: "utf-8",
                            success: function (response) {

                                dataSource = [];
                                boreholesDataSource = response.features;
                                dataSource = dataSource.concat(boreholesDataSource);
                                if (dashboardComponentInstance) {
                                    dashboardComponentInstance.setDataSource(dataSource);
                                }


                                _self.createModal(response.features, false, titleAsLink);
                                if (!dashboardComponentInstance) {
                                    throw new Error(`Unable to find the component instance`);
                                }
                            },
                            error: function () {
                            }
                        });
                    });
                }, "watsonc");

                let svgCirclePart = symbolizer.getSymbol(layerName);
                if (svgCirclePart) {
                    layerTree.setPointToLayer(layerName, (feature, latlng) => {
                        let renderIcon = true;
                        if (layerName === LAYER_NAMES[1]) {
                            if (feature.properties.loctypeid &&
                                (enabledLoctypeIds.indexOf(parseInt(feature.properties.loctypeid) + '') === -1 && enabledLoctypeIds.indexOf(parseInt(feature.properties.loctypeid)) === -1)) {
                                renderIcon = false;
                            }
                        } else {
                            return L.circleMarker(latlng);
                        }

                        if (renderIcon) {
                            let participatingIds = [];
                            if (dashboardComponentInstance) {
                                let plots = dashboardComponentInstance.getPlots();
                                plots.map(plot => {
                                    participatingIds = participatingIds.concat(_self.participatingIds(plot));
                                });
                            }

                            let highlighted = (participatingIds.indexOf(feature.properties.gid) > -1);
                            let localSvgCirclePart = symbolizer.getSymbol(layerName, {
                                online: feature.properties.status,
                                shape: feature.properties.loctypeid,
                                highlighted
                            });

                            let icon = L.icon({
                                iconUrl: 'data:image/svg+xml;base64,' + btoa(localSvgCirclePart),
                                iconAnchor: [8, 33],
                                iconSize: [30, 30],
                                watsoncStatus: `default`
                            });

                            return L.marker(latlng, {icon});
                        } else {
                            return null;
                        }
                    });
                }
            });

            // Renewing the already created store by rebuilding the layer tree
            setTimeout(() => {
                console.log("Opening panels (From get state)");

                setTimeout(() => {
                    layerTree.create(false, [], true).then(() => {
                        //layerTree.reloadLayer(LAYER_NAMES[0]);
                        if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[1]) > -1) {
                            layerTree.reloadLayer(LAYER_NAMES[1]);
                        }
                        if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[0]) > -1) {
                            layerTree.reloadLayer(LAYER_NAMES[0]);
                        }
                    });
                }, 500);
            }, 100);

            const proceedWithInitialization = () => {
                // Setting up feature dialog
                $(`#` + FEATURE_CONTAINER_ID).find(".expand-less").on("click", function () {
                    $("#" + FEATURE_CONTAINER_ID).animate({
                        bottom: (($("#" + FEATURE_CONTAINER_ID).height() * -1) + 30) + "px"
                    }, 500, function () {
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-less").hide();
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-more").show();
                    });
                });

                $(`#` + FEATURE_CONTAINER_ID).find(".expand-more").on("click", function () {
                    $("#" + FEATURE_CONTAINER_ID).animate({
                        bottom: "0"
                    }, 500, function () {
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-less").show();
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-more").hide();
                    });
                });

                $(`#` + FEATURE_CONTAINER_ID).find(".close-hide").on("click", function () {
                    $("#" + FEATURE_CONTAINER_ID).animate({
                        bottom: "-100%"
                    }, 500, function () {
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-less").show();
                        $(`#` + FEATURE_CONTAINER_ID).find(".expand-more").hide();
                    });
                });

                // Initializing data source and types selector
                $(`[data-module-id="data-source-and-types-selector"]`).click(() => {
                    if ($(`#data-source-and-types-selector-content`).children().length === 0) {
                        try {
                            ReactDOM.render(<Provider store={reduxStore}>
                                <MenuDataSourceAndTypeSelectorComponent
                                    onApply={_self.onApplyLayersAndChemical}
                                    enabledLoctypeIds={enabledLoctypeIds}
                                    urlparser={urlparser}
                                    boreholes={layerTree.getActiveLayers().indexOf("_") > -1} // DIRTY HACK All raster layers has _ in name
                                    layers={DATA_SOURCES}/>
                            </Provider>, document.getElementById(`data-source-and-types-selector-content`));
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });

                // Initializing TimeSeries management component
                $(`[data-module-id="timeseries"]`).click(() => {
                    if ($(`#watsonc-timeseries`).children().length === 0) {
                        try {
                            ReactDOM.render(<Provider store={reduxStore}>
                                <MenuTimeSeriesComponent
                                    backboneEvents={backboneEvents}
                                    license={dashboardComponentInstance.getLicense()}
                                    initialPlots={dashboardComponentInstance.getPlots()}
                                    initialActivePlots={dashboardComponentInstance.getActivePlots()}
                                    onPlotCreate={dashboardComponentInstance.handleCreatePlot}
                                    onPlotDelete={dashboardComponentInstance.handleDeletePlot}
                                    onPlotHighlight={dashboardComponentInstance.handleHighlightPlot}
                                    onPlotShow={dashboardComponentInstance.handleShowPlot}
                                    onPlotArchive={dashboardComponentInstance.handleArchivePlot}
                                    onPlotHide={dashboardComponentInstance.handleHidePlot}/></Provider>, document.getElementById(`watsonc-timeseries`));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });

                // Initializing profiles tab
                if ($(`#profile-drawing-content`).length === 0) throw new Error(`Unable to get the profile drawing tab`);

                // Initializing TimeSeries management component
                $(`[data-module-id="profile-drawing"]`).click(() => {
                    try {
                        ReactDOM.render(<Provider store={reduxStore}>
                            <MenuProfilesComponent
                                cloud={cloud}
                                backboneEvents={backboneEvents}
                                license={dashboardComponentInstance.getLicense()}
                                categories={categoriesOverall ? categoriesOverall : []}
                                initialProfiles={dashboardComponentInstance.getProfiles()}
                                initialActiveProfiles={dashboardComponentInstance.getActiveProfiles()}
                                onProfileCreate={dashboardComponentInstance.handleCreateProfile}
                                onProfileDelete={dashboardComponentInstance.handleDeleteProfile}
                                onProfileHighlight={dashboardComponentInstance.handleHighlightProfile}
                                onProfileShow={dashboardComponentInstance.handleShowProfile}
                                onProfileHide={dashboardComponentInstance.handleHideProfile}/>
                        </Provider>, document.getElementById(`profile-drawing-content`));

                        backboneEvents.get().on(`reset:all reset:profile-drawing off:all`, () => {
                            window.menuProfilesComponentInstance.stopDrawing();
                        });
                    } catch (e) {
                        console.error(e);
                    }
                });

                if (dashboardComponentInstance) dashboardComponentInstance.onSetMin();
            };

            if (document.getElementById(DASHBOARD_CONTAINER_ID)) {
                let initialPlots = [];
                if (applicationState && `modules` in applicationState && MODULE_NAME in applicationState.modules && `plots` in applicationState.modules[MODULE_NAME]) {
                    initialPlots = applicationState.modules[MODULE_NAME].plots;
                }

                let initialProfiles = [];
                if (applicationState && `modules` in applicationState && MODULE_NAME in applicationState.modules && `profiles` in applicationState.modules[MODULE_NAME]) {
                    initialProfiles = applicationState.modules[MODULE_NAME].profiles;
                }

                let plotManager = new PlotManager();
                plotManager.hydratePlotsFromUser(initialPlots).then(hydratedInitialPlots => { // User plots
                    try {
                        dashboardComponentInstance = ReactDOM.render(<DashboardComponent
                            backboneEvents={backboneEvents}
                            initialPlots={hydratedInitialPlots}
                            initialProfiles={initialProfiles}
                            onOpenBorehole={this.openBorehole.bind(this)}
                            onPlotsChange={(plots = false) => {
                                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                                if (plots) {
                                    _self.setStyleForPlots(plots);

                                    if (window.menuTimeSeriesComponentInstance) window.menuTimeSeriesComponentInstance.setPlots(plots);
                                    // Plots were updated from the DashboardComponent component
                                    if (modalComponentInstance) _self.createModal(false, plots);
                                }
                            }}
                            onProfilesChange={(profiles = false) => {
                                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                                if (profiles && window.menuProfilesComponentInstance) window.menuProfilesComponentInstance.setProfiles(profiles);
                            }}
                            onActivePlotsChange={(activePlots) => {
                                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                                if (window.menuTimeSeriesComponentInstance) window.menuTimeSeriesComponentInstance.setActivePlots(activePlots);
                            }}
                            onActiveProfilesChange={(activeProfiles) => {
                                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                                if (window.menuProfilesComponentInstance) window.menuProfilesComponentInstance.setActiveProfiles(activeProfiles);
                            }}
                            onHighlightedPlotChange={(plotId, plots) => {
                                _self.setStyleForHighlightedPlot(plotId, plots);
                                if (window.menuTimeSeriesComponentInstance) window.menuTimeSeriesComponentInstance.setHighlightedPlot(plotId);
                            }}/>, document.getElementById(DASHBOARD_CONTAINER_ID));
                    } catch (e) {
                        console.error(e);
                    }
                    proceedWithInitialization();
                }).catch(() => {
                    console.error(`Unable to hydrate initial plots`, initialPlots);
                });
            } else {
                console.warn(`Unable to find the container for watsonc extension (element id: ${DASHBOARD_CONTAINER_ID})`);
            }
        });
        $(`#search-border`).trigger(`click`);
    },


    openBorehole(boreholeIdentifier) {
        let mapLayers = layers.getMapLayers();
        let boreholeIsInViewport = false;
        mapLayers.map(layer => {
            if ([LAYER_NAMES[0], LAYER_NAMES[1]].indexOf(layer.id) > -1 && layer._layers) {
                for (let key in layer._layers) {
                    if (layer._layers[key].feature && layer._layers[key].feature.properties && layer._layers[key].feature.properties.boreholeno) {
                        if (layer._layers[key].feature.properties.boreholeno.trim() === boreholeIdentifier.trim()) {
                            layer._layers[key].fire(`click`);
                            boreholeIsInViewport = true;
                            setTimeout(() => {
                                _self.bringFeaturesDialogToFront();
                            }, 500);
                        }
                    }
                }
            }
        });

        if (boreholeIsInViewport === false) {
            alert(__(`Requested borehole is not in a viewport (data is not loaded)`));
        }
    },

    bringFeaturesDialogToFront() {
        if ($('#watsonc-plots-dialog-form').css('z-index') === '1000') {
            $('#watsonc-plots-dialog-form').css('z-index', '100');
        } else {
            $('#watsonc-plots-dialog-form').css('z-index', '10');
        }

        $('#watsonc-features-dialog').css('z-index', '1000');

        if ($('#search-ribbon').css('z-index') === '1000') {
            $('#search-ribbon').css('z-index', '100');
        } else {
            $('#search-ribbon').css('z-index', '10');
        }
    },

    initializeSearchBar() {
        let searchBar = $(`#js-watsonc-search-field`);
        $(searchBar).parent().attr(`style`, `padding-top: 8px;`);
        $(searchBar).attr(`style`, `max-width: 200px; float: right;`);
        $(searchBar).append(`<div class="input-group">
            <input type="text" class="form-control" placeholder="${__(`Search`) + '...'}" style="color: white;"/>
            <span class="input-group-btn">
                <button class="btn btn-primary" type="button" style="color: white;">
                    <i class="fa fa-search"></i>
                </button>
            </span>
        </div>`);

        $(searchBar).find('input').focus(function () {
            $(this).attr(`placeholder`, __(`Enter borehole, installation, station`) + '...');
            $(searchBar).animate({"max-width": `400px`});
        });

        $(searchBar).find('input').blur(function () {
            $(this).attr(`placeholder`, __(`Search`) + '...');
            if ($(this).val() === ``) {
                $(searchBar).animate({"max-width": `200px`});
            }
        });

        $(searchBar).find('button').click(() => {
            alert(`Search button was clicked`);
        });
    },

    buildBreadcrumbs(secondLevel = false, thirdLevel = false, isWaterLevel = false) {
        $(`.js-layer-slide-breadcrumbs`).attr('style', 'height: 60px; padding-top: 10px;');
        $(`.js-layer-slide-breadcrumbs`).empty();
        if (secondLevel !== false) {
            let firstLevel = `Kemi`;
            let secondLevelMarkup = `<li class="active" style="color: rgba(255, 255, 255, 0.84);">${secondLevel}</li>`;
            if (isWaterLevel) {
                firstLevel = `Vandstand`;
                secondLevelMarkup = ``;
            }

            $(`.js-layer-slide-breadcrumbs`).append(`<ol class="breadcrumb" style="background-color: transparent; margin-bottom: 0px;">
                <li class="active" style="color: rgba(255, 255, 255, 0.84);"><i class="fa fa-database"></i> ${firstLevel}</li>
                ${secondLevelMarkup}
                <li class="active" style="color: rgba(255, 255, 255, 0.84);">
                    <span style="color: rgb(160, 244, 197); font-weight: bold;">${thirdLevel}<span>
                </li>
            </ol>`);
        }
    },

    onApplyLayersAndChemical: (parameters) => {
        // Disabling all layers
        layerTree.getActiveLayers().map(layerNameToEnable => {
            if (layerNameToEnable !== LAYER_NAMES[2])
                switchLayer.init(layerNameToEnable, false);
        });

        // Bind tool tip to stations
        layerTree.setOnLoad(LAYER_NAMES[1], () => {
            _self.bindToolTipOnStations()
        }, "watsonc");

        // Enable raster layer
        if (parameters.layers.indexOf(LAYER_NAMES[0]) > -1) {
            let rasterToEnable = `system._${parameters.chemical}`;
            currentRasterLayer = rasterToEnable;
            switchLayer.init(rasterToEnable, true).then(() => {
                if (parameters.chemical) {
                    _self.enableChemical(parameters.chemical, filteredLayers);
                } else {
                    lastSelectedChemical = parameters.chemical;
                    filteredLayers.map(layerName => {
                        layerTree.reloadLayer(layerName); // TODO
                    });
                }
            });
        }

        let filteredLayers = [];
        enabledLoctypeIds = [];
        parameters.layers.map(layerName => {
            if (layerName.indexOf(LAYER_NAMES[0]) === 0) {
                filteredLayers.push(layerName);
            }
            if (layerName.indexOf(LAYER_NAMES[1]) === 0) {
                if (layerName.indexOf(`#`) > -1) {
                    if (filteredLayers.indexOf(layerName.split(`#`)[0]) === -1) {
                        filteredLayers.push(layerName.split(`#`)[0]);
                    }
                    enabledLoctypeIds.push(layerName.split(`#`)[1]);
                } else {
                    if (filteredLayers.indexOf(layerName) === -1) {
                        filteredLayers.push(layerName);
                    }
                }
            }
        });

        // Wait a bit with trigger state, so this
        setTimeout(() => {
            backboneEvents.get().trigger(`${MODULE_NAME}:enabledLoctypeIdsChange`);
        }, 1500);

        if (parameters.chemical) {
            _self.enableChemical(parameters.chemical, filteredLayers);
        } else {
            lastSelectedChemical = parameters.chemical;
            filteredLayers.map(layerName => {
                layerTree.reloadLayer(layerName); // TODO
            });
        }
    },

    /**
     * Open module menu modal dialog
     *
     * @returns {void}
     */
    openMenuModal: (open = true) => {
        const onCloseHandler = () => {
            $('#watsonc-menu-dialog').modal('hide');
        };

        const introlModalPlaceholderId = `watsonc-intro-modal-placeholder`;
        if ($(`#${introlModalPlaceholderId}`).is(`:empty`)) {
            try {
                ReactDOM.render(<Provider store={reduxStore}>
                    <IntroModal
                        ref={inst => {
                            infoModalInstance = inst;
                        }}
                        anchor={anchor}
                        state={state}
                        urlparser={urlparser}
                        backboneEvents={backboneEvents}
                        layers={DATA_SOURCES}
                        categories={categoriesOverall ? categoriesOverall : []}
                        onApply={_self.onApplyLayersAndChemical}
                        onClose={onCloseHandler}
                    /></Provider>, document.getElementById(introlModalPlaceholderId));
            } catch (e) {
                console.error(e);
            }
        }

        if (open) {
            $('#watsonc-menu-dialog').modal({
                backdrop: `static`
            });
        }

    },
    createModal: (features, plots = false, titleAsLink = null) => {
        if (features === false) {
            if (lastFeatures) {
                features = lastFeatures;
            }
        }

        if (titleAsLink === null) {
            if (lastTitleAsLink !== null) {
                titleAsLink = lastTitleAsLink;
            }
        } else {
            lastTitleAsLink = titleAsLink;
        }

        if (features !== false) {
            lastFeatures = features;

            let titles = [];
            features.map(item => {
                let title = utils.getMeasurementTitle(item);
                if (titleAsLink) {
                    let link = `http://data.geus.dk/JupiterWWW/borerapport.jsp?dgunr=${encodeURIComponent(item.properties.boreholeno)}`;
                    titles.push(`<a href="${link}" target="_blank" title="${title} @ data.geus.dk">${title}</a>`);
                } else {
                    titles.push(`${title}`);
                }
            });

            if (titles.length === 1) {
                $("#" + FEATURE_CONTAINER_ID).find(`.modal-title`).html(titles[0]);
            } else {
                $("#" + FEATURE_CONTAINER_ID).find(`.modal-title`).html(`${__(`Boreholes`)} (${titles.join(`, `)})`);
            }

            if (document.getElementById(FORM_FEATURE_CONTAINER_ID)) {
                try {
                    let existingPlots = dashboardComponentInstance.getPlots(false);

                    setTimeout(() => {
                        ReactDOM.unmountComponentAtNode(document.getElementById(FORM_FEATURE_CONTAINER_ID));
                        modalComponentInstance = ReactDOM.render(<ModalComponent
                            features={features}
                            categories={categories}
                            dataSource={dataSource}
                            names={names}
                            limits={limits}
                            initialPlots={(existingPlots ? existingPlots : [])}
                            license={dashboardComponentInstance.getLicense()}
                            onAddMeasurement={(plotId, featureGid, featureKey, featureIntakeIndex) => {
                                dashboardComponentInstance.addMeasurement(plotId, featureGid, featureKey, featureIntakeIndex);
                            }}
                            onDeleteMeasurement={(plotId, featureGid, featureKey, featureIntakeIndex) => {
                                dashboardComponentInstance.deleteMeasurement(plotId, featureGid, featureKey, featureIntakeIndex);
                            }}
                            onPlotAdd={((newPlotTitle) => {
                                dashboardComponentInstance.addPlot(newPlotTitle, true);
                            })}/>, document.getElementById(FORM_FEATURE_CONTAINER_ID));
                    }, 100);
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.warn(`Unable to find the container for borehole component (element id: ${FORM_FEATURE_CONTAINER_ID})`);
            }
        }

        _self.bringFeaturesDialogToFront();
    },

    /**
     * Sets style for highlighted plot
     *
     * @param {Number} plotId Plot identifier
     * @param {Array}  plots  Existing plots
     *
     * @return {void}
     */
    setStyleForHighlightedPlot: (plotId, plots) => {
        // If specific chemical is activated, then do not style
        if (lastSelectedChemical === false) {
            let participatingIds = [];
            plots.map(plot => {
                if (plot.id === plotId) {
                    let localParticipatingIds = _self.participatingIds(plot);
                    participatingIds = participatingIds.concat(localParticipatingIds);
                }
            });

            _self.highlightFeatures(participatingIds);
        }
    },

    participatingIds(plot) {
        let participatingIds = [];
        if ("measurements" in plot) {
            plot.measurements.map(measurement => {
                let splitMeasurement = measurement.split(`:`);
                if (splitMeasurement.length === 3) {
                    let id = parseInt(splitMeasurement[0]);
                    if (participatingIds.indexOf(id) === -1) participatingIds.push(id);
                }
            });
        } else {
            participatingIds = [];
        }

        return participatingIds;
    },

    /**
     * Sets style for all plots
     *
     * @param {Array} plots Existing plots
     *
     * @return {void}
     */
    setStyleForPlots: (plots) => {
        // If specific chemical is activated, then do not style
        if (lastSelectedChemical === false) {
            let participatingIds = [];
            plots.map(plot => {
                let localParticipatingIds = _self.participatingIds(plot);
                participatingIds = participatingIds.concat(localParticipatingIds)
            });

            _self.highlightFeatures(participatingIds);
        } else {
            let activeLayers = layerTree.getActiveLayers();
            activeLayers.map(activeLayerKey => {
                _self.displayChemicalSymbols(activeLayerKey);
            });
        }
    },

    highlightFeatures(participatingIds) {
        let mapLayers = layers.getMapLayers();
        mapLayers.map(layer => {
            if ([LAYER_NAMES[0], LAYER_NAMES[1]].indexOf(layer.id) > -1 && layer._layers) {
                for (let key in layer._layers) {
                    let featureLayer = layer._layers[key];
                    if (featureLayer.feature && featureLayer.feature.properties && featureLayer.feature.properties.gid) {
                        let icon = L.icon({
                            iconUrl: 'data:image/svg+xml;base64,' + btoa(getSymbol(layer.id, {
                                online: featureLayer.feature.properties.status,
                                shape: featureLayer.feature.properties.loctypeid,
                                highlighted: (participatingIds.indexOf(featureLayer.feature.properties.gid) > -1)
                            })),
                            iconAnchor: [8, 33],
                            watsoncStatus: participatingIds.indexOf(featureLayer.feature.properties.gid) > -1 ? `highlighted` : `default`
                        });

                        if (icon && `setIcon` in featureLayer) {
                            // Do not set icon if the existing one is the same as the new one
                            let statusOfExistingIcon = (`watsoncStatus` in featureLayer.options.icon.options ? featureLayer.options.icon.options.watsoncStatus : false);
                            let statusOfNewIcon = icon.options.watsoncStatus;
                            if (statusOfExistingIcon === false) {
                                featureLayer.setIcon(icon);
                            } else {
                                if (statusOfExistingIcon !== statusOfNewIcon) {
                                    featureLayer.setIcon(icon);
                                }
                            }
                        }
                    }
                }
            }
        });
    },

    bindToolTipOnStations() {
        let stores = layerTree.getStores();
        stores["v:sensor.sensordata_without_correction"].layer.eachLayer(function (layer) {
            let feature = layer.feature;
            let html = [];
            html.push(`${feature.properties.mouseover}`);
            layer.bindTooltip(`${html.join('<br>')}`);
        });
    },

    displayChemicalSymbols(storeId) {
        let stores = layerTree.getStores();
        let participatingIds = [];
        if (dashboardComponentInstance) {
            let plots = dashboardComponentInstance.getPlots();
            plots.map(plot => {
                participatingIds = participatingIds.concat(_self.participatingIds(plot));
            });
        }

        if (stores[storeId]) {
            stores[storeId].layer.eachLayer(function (layer) {
                let feature = layer.feature;
                if ("maxvalue" in feature.properties && "latestvalue" in feature.properties) {

                    let html = [];
                    html.push(`
                        ${__(`Max`)}: ${feature.properties.maxvalue}<br>
                        ${__(`Latest`)}: ${feature.properties.latestvalue}<br>`);

                    layer.bindTooltip(`<p><a target="_blank" href="https://data.geus.dk/JupiterWWW/borerapport.jsp?dgunr=${feature.properties.boreholeno}">${feature.properties.boreholeno}</a></p>
                    <b style="color: rgb(16, 174, 140)">${names[lastSelectedChemical]}</b><br>${html.join('<br>')}`);

                }
            });
        }
    },

    enableChemical(chemicalId, layersToEnable = [], onComplete = false) {
        console.log("chemicalId first", chemicalId);
        if (!chemicalId) throw new Error(`Chemical identifier was not provided`);
        setTimeout(() => {
            let layersToEnableWereProvided = (layersToEnable.length > 0);
            if (categoriesOverall) {
                for (let layerName in categoriesOverall) {
                    for (let key in categoriesOverall[layerName]) {
                        for (let key2 in categoriesOverall[layerName][key]) {
                            if (key2.toString() === chemicalId.toString() || categoriesOverall[layerName][key][key2] === chemicalId.toString()) {
                                if (layersToEnableWereProvided === false) {
                                    if (layersToEnable.indexOf(layerName) === -1) {
                                        layersToEnable.push(layerName);
                                        console.log(layerName);
                                    }
                                    console.log(chemicalId);
                                }
                                _self.buildBreadcrumbs(key, categoriesOverall[layerName][key][key2], layerName === LAYER_NAMES[1]);
                                break;
                            }
                        }
                    }
                }
            }
            console.log("chemicalId second", chemicalId);

            layerTree.applyFilters({
                "system.all": {
                    match: "any", columns: [
                        {fieldname: "compound", expression: "=", value: chemicalId, restriction: false}
                    ]

                }
            });
            lastSelectedChemical = chemicalId;
            backboneEvents.get().trigger(`${MODULE_NAME}:chemicalChange`);
            let onLoadCallback = function (store) {
                if (layersToEnable.indexOf(store.id) > -1) {
                    _self.displayChemicalSymbols(store.id);
                }
            };
            layerTree.setOnLoad(LAYER_NAMES[0], onLoadCallback, "watsonc");
            layersToEnable.map(layerName => {
                layerTree.reloadLayer(layerName);
            });
            layerTree.setStyle(LAYER_NAMES[0], {
                "color": "#ffffff",
                "weight": 0,
                "opacity": 0.0,
                "fillOpacity": 0.0
            });

            if (onComplete) onComplete();
        }, 0);
    },


    getExistingPlots: () => {
        if (dashboardComponentInstance) {
            return dashboardComponentInstance.getPlots();
        } else {
            throw new Error(`Unable to find the component instance`);
        }
    },

    getExistingActivePlots: () => {
        if (dashboardComponentInstance) {
            return dashboardComponentInstance.getActivePlots();
        } else {
            throw new Error(`Unable to find the component instance`);
        }
    },

    getExistingActiveProfiles: () => {
        if (dashboardComponentInstance) {
            return dashboardComponentInstance.getActiveProfileObjects();
        } else {
            throw new Error('Unable to find the component instance');
        }
    },

    /**
     * Returns current module state
     */
    getState: () => {
        let plots = dashboardComponentInstance.dehydratePlots(_self.getExistingActivePlots());
        let profiles = _self.getExistingActiveProfiles();
        return {
            plots,
            profiles,
            selectedChemical: lastSelectedChemical,
            enabledLoctypeIds
        };
    },

    /**
     * Applies externally provided state
     */
    applyState: (newState) => {
        return new Promise((resolve, reject) => {
            let plotsWereProvided = false;
            if (newState && `plots` in newState && newState.plots.length > 0) {
                plotsWereProvided = true;
            }

            let profilesWereProvided = false;
            if (newState && `profiles` in newState && newState.profiles.length > 0) {
                profilesWereProvided = true;
            }

            const continueWithInitialization = (populatedPlots) => {
                if (populatedPlots) {
                    dashboardComponentInstance.setProjectPlots(populatedPlots);
                    populatedPlots.map((item) => {
                        dashboardComponentInstance.handleShowPlot(item.id);
                    });
                    if (window.menuTimeSeriesComponentInstance) {
                        window.menuTimeSeriesComponentInstance.setPlots(dashboardComponentInstance.getPlots());
                    }
                }

                if (newState.enabledLoctypeIds && Array.isArray(newState.enabledLoctypeIds)) {
                    enabledLoctypeIds = newState.enabledLoctypeIds;
                }

                if (newState.selectedChemical) {
                    lastSelectedChemical = newState.selectedChemical;

                    if (plotsWereProvided) {
                        $(`[href="#watsonc-content"]`).trigger(`click`);
                    }

                    backboneEvents.get().once("allDoneLoading:layers", e => {
                        setTimeout(() => {
                            _self.enableChemical(newState.selectedChemical);
                            resolve();
                        }, 1000);
                    });
                } else {
                    $(`.js-clear-breadcrubms`).trigger(`click`);
                    if (plotsWereProvided) {
                        $(`[href="#watsonc-content"]`).trigger(`click`);
                    }

                    resolve();
                }
            };

            if (plotsWereProvided) {
                (function poll() {
                    if (typeof dashboardComponentInstance === "object") {
                        dashboardComponentInstance.hydratePlotsFromIds(newState.plots).then(continueWithInitialization).catch(error => {
                            console.error(`Error occured while hydrating plots at state application`, error);
                        });
                    } else {
                        setTimeout(() => {
                            console.log("POLLING");
                            poll();
                        }, 100)
                    }
                }());

            } else {
                continueWithInitialization();
            }

            if (profilesWereProvided) {
                (function poll() {
                    if (typeof dashboardComponentInstance === "object") {
                        dashboardComponentInstance.setProjectProfiles(newState.profiles);
                        if (window.menuProfilesComponentInstance) {
                            window.menuProfilesComponentInstance.setProfiles(dashboardComponentInstance.getProfiles());
                        }
                    } else {
                        setTimeout(() => {
                            console.log("POLLING");
                            poll();
                        }, 100)
                    }
                }());
            }
        });
    }
};
