"use strict";

import { Provider } from "react-redux";
import "regenerator-runtime/runtime";

import AnalyticsComponent from "./components/AnalyticsComponent";
import MenuProfilesComponent from "./components/MenuProfilesComponent";
import {
  KOMMUNER,
  LAYER_NAMES,
  GEOLOGICAL_LAYER_NAME,
  WATER_LEVEL_KEY,
  LOGIN_MODAL_DIALOG_PREFIX,
} from "./constants";
import trustedIpAddresses from "./trustedIpAddresses";
import ThemeProvider from "./themes/ThemeProvider";
import DataSelectorDialogue from "./components/dataselector/DataSelectorDialogue";
import DashboardWrapper from "./components/DashboardWrapper";
import TopBar from "./components/TopBar";
import LoginModal from "./components/LoginModal";
import { showSubscriptionIfFree } from "./helpers/show_subscriptionDialogue";

import reduxStore from "./redux/store";
import {
  addBoreholeFeature,
  clearBoreholeFeatures,
  setAuthenticated,
  setBoreholeFeatures,
  setCategories,
} from "./redux/actions";
import { useDashboardStore } from "./zustand/store";

const symbolizer = require("./symbolizer");

const utils = require("./utils");

const MODULE_NAME = `watsonc`;

/**
 * The feature dialog constants
 */
const FEATURE_CONTAINER_ID = "watsonc-features-dialog";

/**
 * The plots dialog constants
 */
const DASHBOARD_CONTAINER_ID = "watsonc-plots-dialog-form";
let PLOTS_ID = `#` + DASHBOARD_CONTAINER_ID;

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud,
  switchLayer,
  backboneEvents,
  session = false;
/**
 *
 * @type {*|exports|module.exports}
 */
var layerTree, layers, anchor, state, urlparser;

var React = require("react");

var ReactDOM = require("react-dom");
var ReactDOMServer = require("react-dom/server");

let dashboardComponentInstance = false,
  modalComponentInstance = false,
  infoModalInstance = false;
let dashboardShellInstance = false;

let lastSelectedChemical = false,
  categoriesOverall = false,
  enabledLoctypeIds = [];

let _self = false;

let lastFeatures = false;

let lastTitleAsLink = null;

let dataSource = [];

let boreholesDataSource = [];

let store;

let categories = {};
let limits = {};
let names = {};

let currentRasterLayer = null;

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

    state.getModuleState(MODULE_NAME).then((initialState) => {
      _self.applyState(initialState);
    });

    this.initializeSearchBar();

    let queryParams = new URLSearchParams(window.location.search);
    let licenseToken = queryParams.get("license");
    let license = null;

    if (licenseToken) {
      license = JSON.parse(base64.decode(licenseToken.split(".")[1]));
      if (typeof license === "object") {
        license = license.license;
      }
    }
    if (trustedIpAddresses.includes(window._vidiIp)) {
      license = "premium";
    }

    if (license === "premium") {
      $("#watsonc-licens-btn1").html("");
      $("#watsonc-licens-btn2").html("Valgt");
      $("#watsonc-licens-btn2").attr("disabled", true);
      $("#watsonc-licens-btn2").css("pointer-events", "none");
    } else {
      $("#watsonc-licens-btn1").html("Valgt");
      $("#watsonc-licens-btn2").html("Vælg");
    }

    $(document).on("click", "#profile_models", (e) => {
      if (e.target.checked) {
        useDashboardStore.getState().setGeologicalLayerChecked(true);
      } else {
        useDashboardStore.getState().setGeologicalLayerChecked(false);
      }
    });

    $("#btn-plan").on("click", () => {
      $("#watsonc-limits-reached-text").hide();
      $("#upgrade-modal").modal("show");
    });

    backboneEvents.get().on(`session:authChange`, (authenticated) => {
      reduxStore.dispatch(setAuthenticated(authenticated));
    });

    backboneEvents.get().on("ready:meta", function () {
      setTimeout(() => {
        $(".panel-title a").trigger("click");
      }, 1000);
    });

    $("#watsonc-plots-dialog-form").click(function () {
      $("#watsonc-plots-dialog-form").css("z-index", "1000");

      if ($("#watsonc-features-dialog").css("z-index") === "1000") {
        $("#watsonc-features-dialog").css("z-index", "100");
      } else {
        $("#watsonc-features-dialog").css("z-index", "10");
      }

      if ($("#search-ribbon").css("z-index") === "1000") {
        $("#search-ribbon").css("z-index", "100");
      } else {
        $("#search-ribbon").css("z-index", "10");
      }
    });

    $("#watsonc-features-dialog").click(function () {
      _self.bringFeaturesDialogToFront();
    });

    $("#watsonc-data-sources").on("click", () => {
      $("#watsonc-menu-dialog").modal("show");
    });

    $("#search-ribbon").click(function () {
      if ($("#watsonc-plots-dialog-form").css("z-index") === "1000") {
        $("#watsonc-plots-dialog-form").css("z-index", "100");
      } else {
        $("#watsonc-plots-dialog-form").css("z-index", "10");
      }

      if ($("#watsonc-features-dialog").css("z-index") === "1000") {
        $("#watsonc-features-dialog").css("z-index", "100");
      } else {
        $("#watsonc-features-dialog").css("z-index", "10");
      }

      $("#search-ribbon").css("z-index", "1000");
    });

    var lc = L.control
      .locate({
        drawCircle: false,
      })
      .addTo(cloud.get().map);

    $(`#search-border`).trigger(`click`);

    $(`#js-open-state-snapshots-panel`).click(() => {
      //$(`[href="#state-snapshots-content"]`).trigger(`click`);
    });

    $(`#state-snapshots-content`).click((e) => {
      if (showSubscriptionIfFree()) {
        var elem = document.getElementById("state-snapshots");
        elem.style.pointerEvents = "none";
      }
      //$(`[href="#state-snapshots-content"]`).trigger(`click`);
    });

    $("#projects-trigger").click((e) => {
      e.preventDefault();
      //reduxStore.dispatch(setDashboardContent('projects'));
    });

    $("#main-tabs a").on("click", function (e) {
      $("#module-container.slide-right").css("right", "0");
    });

    $(document).on(
      "click",
      "#module-container .modal-header button",
      function (e) {
        if (
          _self.hasActiveLayer(GEOLOGICAL_LAYER_NAME) &&
          $("#profile-drawing-content").hasClass("tab-pane fade active in")
        ) {
          _self.disableActiveGeologicalLayer(GEOLOGICAL_LAYER_NAME);
          switchLayer.uncheckLayerControl("calypso_layers.profile_models");
        }

        e.preventDefault();
        $("#module-container.slide-right").css("right", "-" + 466 + "px");
        $("#side-panel ul li").removeClass("active");
        $("#search-ribbon").css("right", "-550px");
        $("#pane").css("right", "0");
        $("#map").css("width", "100%");
      }
    );

    $(`#js-open-watsonc-panel`).click(() => {
      $(`[href="#watsonc-content"]`).trigger(`click`);
    });

    $(".panel-title a").trigger("click");

    // Turn on raster layer with all boreholes.
    // switchLayer.init(LAYER_NAMES[2], true, true, false);
    ReactDOM.render(
      <ThemeProvider>
        <Provider store={reduxStore}>
          <TopBar backboneEvents={backboneEvents} session={session} />
        </Provider>
      </ThemeProvider>,
      document.getElementById("top-bar")
    );

    ReactDOM.render(
      <Provider store={reduxStore}>
        <ThemeProvider>
          <LoginModal
            session={session}
            backboneEvents={backboneEvents}
            urlparser={urlparser}
          />
        </ThemeProvider>
      </Provider>,
      document.getElementById(LOGIN_MODAL_DIALOG_PREFIX)
    );
    $("#" + LOGIN_MODAL_DIALOG_PREFIX).modal("hide");

    $.ajax({
      url: "/api/sql/jupiter?q=SELECT * FROM codes.compunds_view&base64=false&lifetime=10800",
      scriptCharset: "utf-8",
      success: function (response) {
        if (`features` in response) {
          categories = {};
          limits = {};

          response.features.map(function (v) {
            categories[v.properties.kategori.trim()] = {};
            names[v.properties.compundno] = v.properties.our_name;
          });

          names[WATER_LEVEL_KEY] = "Vandstand";

          for (var key in categories) {
            response.features.map(function (v) {
              if (key === v.properties.kategori) {
                categories[key][v.properties.compundno] = v.properties.our_name;
                limits["_" + v.properties.compundno] = [
                  v.properties.attention || 0,
                  v.properties.limit || 0,
                ];
              }
            });
          }
          reduxStore.dispatch(setLimits(limits));

          _self.buildBreadcrumbs();

          categoriesOverall = {};
          categoriesOverall[LAYER_NAMES[0]] = categories;
          categoriesOverall[LAYER_NAMES[0]]["Vandstand"] = {
            0: WATER_LEVEL_KEY,
          };
          categoriesOverall[LAYER_NAMES[1]] = {
            Vandstand: { 0: WATER_LEVEL_KEY },
          };

          if (infoModalInstance)
            infoModalInstance.setCategories(categoriesOverall);
          reduxStore.dispatch(setCategories(categories));

          // Setup menu
          let dd = $("li .dropdown-toggle");
          dd.on("click", function (event) {
            $(".dropdown-top").not($(this).parent()).removeClass("open");
            $(".dropdown-submenu").removeClass("open");
            $(this).parent().toggleClass("open");
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
      error: function () {},
    });

    state.getState().then((applicationState) => {
      $(PLOTS_ID).attr(
        `style`,
        `
                margin-bottom: 0px;
                width: 96%;
                max-width: 96%;
                right: 2%;
                left: 2%;
                bottom: 0px;`
      );

      LAYER_NAMES.map((layerName) => {
        layerTree.setOnEachFeature(
          layerName,
          (clickedFeature, layer) => {
            layer.on("click", (e) => {
              $("#" + FEATURE_CONTAINER_ID).animate(
                {
                  bottom: "0",
                },
                500,
                function () {
                  $("#" + FEATURE_CONTAINER_ID)
                    .find(".expand-less")
                    .show();
                  $("#" + FEATURE_CONTAINER_ID)
                    .find(".expand-more")
                    .hide();
                }
              );

              let intersectingFeatures = [];
              if (e.latlng) {
                var clickBounds = L.latLngBounds(e.latlng, e.latlng);
                let res = [
                  156543.033928, 78271.516964, 39135.758482, 19567.879241,
                  9783.9396205, 4891.96981025, 2445.98490513, 1222.99245256,
                  611.496226281, 305.748113141, 152.87405657, 76.4370282852,
                  38.2185141426, 19.1092570713, 9.55462853565, 4.77731426782,
                  2.38865713391, 1.19432856696, 0.597164283478, 0.298582141739,
                  0.149291, 0.074645535,
                ];

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
                        let circle = new L.circle(feature._latlng, {
                          radius: distance,
                        });
                        // DIRTY HACK
                        circle.addTo(mapObj);
                        bounds = circle.getBounds();
                        circle.removeFrom(mapObj);
                      }

                      try {
                        if (
                          bounds &&
                          clickBounds.intersects(bounds) &&
                          overlay.id
                        ) {
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
              intersectingFeatures.map((feature) => {
                if (
                  feature.properties.boreholeno ===
                  clickedFeature.properties.boreholeno
                ) {
                  clickedFeatureAlreadyDetected = true;
                }
              });

              if (clickedFeatureAlreadyDetected === false)
                intersectingFeatures.unshift(clickedFeature);

              let boreholes = [];

              intersectingFeatures.map((feature) => {
                boreholes.push(feature.properties.boreholeno);
              });

              let qLayer;
              if (
                layerName.indexOf(LAYER_NAMES[0]) > -1 ||
                layerName.indexOf(LAYER_NAMES[3]) > -1
              ) {
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
                url:
                  "/api/sql/jupiter?srs=25832&q=SELECT * FROM " +
                  qLayer +
                  " WHERE boreholeno in('" +
                  boreholes.join("','") +
                  "')",
                scriptCharset: "utf-8",
                success: function (response) {
                  dataSource = [];
                  boreholesDataSource = response.features;
                  dataSource = dataSource.concat(boreholesDataSource);
                  if (dashboardComponentInstance) {
                    dashboardComponentInstance.setDataSource(dataSource);
                  }

                  /* layer.bindPopup(ReactDOMServer.renderToString(<Provider store={reduxStore}><ThemeProvider><MapDecorator /></ThemeProvider></Provider>),
                                                      { maxWidth: 500, className: 'map-decorator-popup' });  */
                  reduxStore.dispatch(setBoreholeFeatures(response.features));
                  _self.createModal(
                    response.features,
                    false,
                    titleAsLink,
                    false
                  );
                  if (!dashboardComponentInstance) {
                    throw new Error(`Unable to find the component instance`);
                  }
                },
                error: function () {},
              });
            });
          },
          "watsonc"
        );

        let svgCirclePart = symbolizer.getSymbol(layerName);
        if (svgCirclePart) {
          layerTree.setPointToLayer(layerName, (feature, latlng) => {
            let renderIcon = true;
            if (layerName === LAYER_NAMES[1]) {
              if (
                feature.properties.loctypeid &&
                enabledLoctypeIds.indexOf(
                  parseInt(feature.properties.loctypeid) + ""
                ) === -1 &&
                enabledLoctypeIds.indexOf(
                  parseInt(feature.properties.loctypeid)
                ) === -1
              ) {
                renderIcon = false;
              }
            } else {
              return L.circleMarker(latlng);
            }

            if (renderIcon) {
              let participatingIds = [];
              if (dashboardComponentInstance) {
                let plots = dashboardComponentInstance.getPlots();
                plots.map((plot) => {
                  participatingIds = participatingIds.concat(
                    _self.participatingIds(plot)
                  );
                });
              }

              let highlighted =
                participatingIds.indexOf(feature.properties.boreholeno) > -1;
              let localSvgCirclePart = symbolizer.getSymbol(layerName, {
                online: feature.properties.status,
                shape: feature.properties.loctypeid,
                highlighted,
              });

              let icon = L.icon({
                iconUrl:
                  "data:image/svg+xml;base64," + btoa(localSvgCirclePart),
                iconAnchor: [8, 33],
                iconSize: [30, 30],
                watsoncStatus: `default`,
              });

              return L.marker(latlng, { icon });
            } else {
              return null;
            }
          });
        }
      });

      // Renewing the already created store by rebuilding the layer tree
      setTimeout(() => {
        setTimeout(() => {
          layerTree.create(false, [], true).then(() => {
            //layerTree.reloadLayer(LAYER_NAMES[0]);
            if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[1]) > -1) {
              layerTree.reloadLayer(LAYER_NAMES[1]);
            }
            if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[0]) > -1) {
              layerTree.reloadLayer(LAYER_NAMES[0]);
            }
            if (layerTree.getActiveLayers().indexOf(LAYER_NAMES[3]) > -1) {
              layerTree.reloadLayer(LAYER_NAMES[3]);
            }
          });
        }, 500);
        const active = _self.hasActiveLayer(GEOLOGICAL_LAYER_NAME);
        useDashboardStore.getState().setGeologicalLayerChecked(active);
      }, 100);

      const proceedWithInitialization = () => {
        // Setting up feature dialog
        $(`#` + FEATURE_CONTAINER_ID)
          .find(".expand-less")
          .on("click", function () {
            $("#" + FEATURE_CONTAINER_ID).animate(
              {
                bottom: $("#" + FEATURE_CONTAINER_ID).height() * -1 + 30 + "px",
              },
              500,
              function () {
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-less")
                  .hide();
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-more")
                  .show();
              }
            );
          });

        $(`#` + FEATURE_CONTAINER_ID)
          .find(".expand-more")
          .on("click", function () {
            $("#" + FEATURE_CONTAINER_ID).animate(
              {
                bottom: "0",
              },
              500,
              function () {
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-less")
                  .show();
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-more")
                  .hide();
              }
            );
          });

        $(`#` + FEATURE_CONTAINER_ID)
          .find(".close-hide")
          .on("click", function () {
            $("#" + FEATURE_CONTAINER_ID).animate(
              {
                bottom: "-100%",
              },
              500,
              function () {
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-less")
                  .show();
                $(`#` + FEATURE_CONTAINER_ID)
                  .find(".expand-more")
                  .hide();
              }
            );
          });

        // Initializing TimeSeries management component

        // Initializing profiles tab
        if ($(`#profile-drawing-content`).length === 0) {
          throw new Error(`Unable to get the profile drawing tab`);
        }

        // Initializing TimeSeries management component
        $(`[data-module-id="profile-drawing"]`).click(() => {
          try {
            ReactDOM.render(
              <Provider store={reduxStore}>
                <MenuProfilesComponent
                  cloud={cloud}
                  backboneEvents={backboneEvents}
                  license={dashboardComponentInstance.getLicense()}
                  categories={categoriesOverall ? categoriesOverall : []}
                  initialProfiles={dashboardComponentInstance.getProfiles()}
                  initialActiveProfiles={dashboardComponentInstance.getActiveProfiles()}
                  onProfileCreate={
                    dashboardComponentInstance.handleCreateProfile
                  }
                  onProfileDelete={
                    dashboardComponentInstance.handleDeleteProfile
                  }
                  onProfileHighlight={
                    dashboardComponentInstance.handleHighlightProfile
                  }
                  onProfileAdd={dashboardComponentInstance.handleAddProfile}
                  onProfileShow={dashboardComponentInstance.handleShowProfile}
                  onProfileHide={dashboardComponentInstance.handleHideProfile}
                  layerTree={layerTree}
                  applyGeologicalLayer={_self.applyGeologicalLayer}
                  disableActiveGeologicalLayer={
                    _self.disableActiveGeologicalLayer
                  }
                />
              </Provider>,
              document.getElementById(`profile-drawing-content`)
            );

            backboneEvents
              .get()
              .on(`reset:all reset:profile-drawing off:all`, () => {
                window.menuProfilesComponentInstance.stopDrawing();
              });
          } catch (e) {
            console.error(e);
          }
        });

        // if (dashboardComponentInstance) dashboardComponentInstance.onSetMin();
      };

      if (document.getElementById(DASHBOARD_CONTAINER_ID)) {
        let initialPlots = [];
        if (
          applicationState &&
          `modules` in applicationState &&
          MODULE_NAME in applicationState.modules &&
          `plots` in applicationState.modules[MODULE_NAME]
        ) {
          initialPlots = applicationState.modules[MODULE_NAME].plots;
        }
        let initialProfiles = [];
        if (
          applicationState &&
          `modules` in applicationState &&
          MODULE_NAME in applicationState.modules &&
          `profiles` in applicationState.modules[MODULE_NAME]
        ) {
          initialProfiles = applicationState.modules[MODULE_NAME].profiles;
        }

        let reactRef = React.createRef();
        try {
          ReactDOM.render(
            <DashboardWrapper
              cloud={cloud}
              state={state}
              ref={reactRef}
              session={session}
              backboneEvents={backboneEvents}
              urlparser={urlparser}
              anchor={anchor}
              onApply={_self.onApplyLayersAndChemical}
              initialPlots={[]}
              initialProfiles={initialProfiles}
              onOpenBorehole={this.openBorehole}
              onDeleteMeasurement={(
                plotId,
                featureGid,
                featureKey,
                featureIntakeIndex
              ) => {
                dashboardComponentInstance.deleteMeasurement(
                  plotId,
                  featureGid,
                  featureKey,
                  featureIntakeIndex
                );
              }}
              onAddMeasurement={(
                plotId,
                featureGid,
                featureKey,
                featureIntakeIndex,
                measurementsData,
                relation
              ) => {
                dashboardComponentInstance.addMeasurement(
                  plotId,
                  featureGid,
                  featureKey,
                  featureIntakeIndex,
                  measurementsData,
                  relation
                );
              }}
              /**TODO: Deprecated */
              onPlotsChange={(plots = false, context) => {
                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                // if (plots) {
                //   _self.setStyleForPlots(plots);
                //   console.log("onplotschange", plots);
                //   if (window.menuTimeSeriesComponentInstance)
                //     window.menuTimeSeriesComponentInstance.setPlots(plots);
                //   // Plots were updated from the DashboardComponent component
                //   if (modalComponentInstance) _self.createModal(false, plots);
                //   context.setActivePlots(_self.getExistingActivePlots());
                // }
              }}
              /**TODO: Deprecated */
              onProfilesChange={(profiles = false) => {
                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                //   if (profiles && window.menuProfilesComponentInstance)
                //     window.menuProfilesComponentInstance.setProfiles(profiles);
                // }}
                // onActivePlotsChange={(activePlots, plots, context) => {
                //   backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                //   if (window.menuTimeSeriesComponentInstance)
                //     window.menuTimeSeriesComponentInstance.setActivePlots(
                //       activePlots
                //     );
                //   if (modalComponentInstance) _self.createModal(false, plots);

                //   context.setActivePlots(
                //     plots.filter((plot) => activePlots.indexOf(plot.id) > -1)
                //   );
              }}
              getAllPlots={() => {
                return dashboardComponentInstance.getPlots();
              }}
              getAllProfiles={() => {
                return dashboardComponentInstance.getProfiles();
              }}
              getDashboardItems={() => {
                return dashboardComponentInstance.getDashboardItems();
              }}
              setDashboardItems={(items) => {
                dashboardComponentInstance.setDashboardItems(items);
                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
              }}
              getActiveProfiles={() => {
                return dashboardComponentInstance.getActiveProfileObjects();
              }}
              /**TODO: Deprecated */
              setPlots={(plots, activePlots) => {
                // dashboardComponentInstance.setPlots(plots);
                // dashboardComponentInstance.setActivePlots(activePlots);
              }}
              /**TODO: Deprecated */
              setProfiles={(profiles, activeProfiles) => {
                // dashboardComponentInstance.setProfiles(profiles);
                // dashboardComponentInstance.setActiveProfiles(activeProfiles);
              }}
              onActiveProfilesChange={(activeProfiles, profiles, context) => {
                backboneEvents.get().trigger(`${MODULE_NAME}:plotsUpdate`);
                if (window.menuProfilesComponentInstance)
                  window.menuProfilesComponentInstance.setActiveProfiles(
                    activeProfiles
                  );
                context.setActiveProfiles(
                  profiles.filter(
                    (profile) => activeProfiles.indexOf(profile.key) > -1
                  )
                );
              }}
              onHighlightedPlotChange={(plotId, plots) => {
                _self.setStyleForHighlightedPlot(plotId, plots);
                if (window.menuTimeSeriesComponentInstance)
                  window.menuTimeSeriesComponentInstance.setHighlightedPlot(
                    plotId
                  );
              }}
            />,
            document.getElementById("watsonc-plots-dialog-form-hidden")
          );
          dashboardComponentInstance = reactRef.current;
        } catch (e) {
          console.error(e);
        }
        proceedWithInitialization();
      } else {
        console.warn(
          `Unable to find the container for watsonc extension (element id: ${DASHBOARD_CONTAINER_ID})`
        );
      }
    });
    $(`#search-border`).trigger(`click`);

    try {
      ReactDOM.render(
        <AnalyticsComponent kommuner={KOMMUNER} />,
        document.getElementById("watsonc-analytics-content")
      );
    } catch (e) {
      console.error(e);
    }
  },

  let(boreholeIdentifier) {
    let mapLayers = layers.getMapLayers();
    let boreholeIsInViewport = false;
    mapLayers.map((layer) => {
      if (
        [LAYER_NAMES[0], LAYER_NAMES[1]].indexOf(layer.id) > -1 &&
        layer._layers
      ) {
        for (let key in layer._layers) {
          if (
            layer._layers[key].feature &&
            layer._layers[key].feature.properties &&
            layer._layers[key].feature.properties.boreholeno
          ) {
            if (
              layer._layers[key].feature.properties.boreholeno.trim() ===
              boreholeIdentifier.trim()
            ) {
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
    if ($("#watsonc-plots-dialog-form").css("z-index") === "1000") {
      $("#watsonc-plots-dialog-form").css("z-index", "100");
    } else {
      $("#watsonc-plots-dialog-form").css("z-index", "10");
    }

    $("#watsonc-features-dialog").css("z-index", "1000");

    if ($("#search-ribbon").css("z-index") === "1000") {
      $("#search-ribbon").css("z-index", "100");
    } else {
      $("#search-ribbon").css("z-index", "10");
    }
  },

  initializeSearchBar() {
    let searchBar = $(`#js-watsonc-search-field`);
    $(searchBar).parent().attr(`style`, `padding-top: 8px;`);
    $(searchBar).attr(`style`, `max-width: 200px; float: right;`);
    $(searchBar).append(`<div class="input-group">
            <input type="text" class="form-control" placeholder="${
              __(`Search`) + "..."
            }" style="color: white;"/>
            <span class="input-group-btn">
                <button class="btn btn-primary" type="button" style="color: white;">
                    <i class="fa fa-search"></i>
                </button>
            </span>
        </div>`);

    $(searchBar)
      .find("input")
      .focus(function () {
        $(this).attr(
          `placeholder`,
          __(`Enter borehole, installation, station`) + "..."
        );
        $(searchBar).animate({ "max-width": `400px` });
      });

    $(searchBar)
      .find("input")
      .blur(function () {
        $(this).attr(`placeholder`, __(`Search`) + "...");
        if ($(this).val() === ``) {
          $(searchBar).animate({ "max-width": `200px` });
        }
      });

    $(searchBar)
      .find("button")
      .click(() => {
        alert(`Search button was clicked`);
      });
  },

  buildBreadcrumbs(
    secondLevel = false,
    thirdLevel = false,
    isWaterLevel = false
  ) {
    $(`.js-layer-slide-breadcrumbs`).attr(
      "style",
      "height: 60px; padding-top: 10px;"
    );
    $(`.js-layer-slide-breadcrumbs`).empty();
    if (secondLevel !== false) {
      let firstLevel = `Kemi`;
      let secondLevelMarkup = `<li class="active" style="color: rgba(255, 255, 255, 0.84);">${secondLevel}</li>`;
      if (isWaterLevel) {
        firstLevel = `Vandstand`;
        secondLevelMarkup = ``;
      }

      $(`.js-layer-slide-breadcrumbs`)
        .append(`<ol class="breadcrumb" style="background-color: transparent; margin-bottom: 0px;">
                <li class="active" style="color: rgba(255, 255, 255, 0.84);"><i class="fa fa-database"></i> ${firstLevel}</li>
                ${secondLevelMarkup}
                <li class="active" style="color: rgba(255, 255, 255, 0.84);">
                    <span style="color: rgb(160, 244, 197); font-weight: bold;">${thirdLevel}<span>
                </li>
            </ol>`);
    }
  },

  hasActiveLayer: (layerName) => {
    const layer = layerTree
      .getActiveLayers()
      .find((layer) => layer.startsWith(layerName));
    return layer ? true : false;
  },

  disableActiveGeologicalLayer: (layersToDisable) => {
    layerTree.getActiveLayers().map((layer) => {
      if (layer.startsWith(layersToDisable)) {
        switchLayer.init(layer, false);
        useDashboardStore.getState().setGeologicalLayerChecked(false);
      }
    });
  },

  applyGeologicalLayer: (layerToActivate) => {
    switchLayer.init(layerToActivate, true);
    useDashboardStore.getState().setGeologicalLayerChecked(true);
  },

  onApplyLayersAndChemical: (parameters) => {
    // Disabling all layers
    layerTree.getActiveLayers().map((layerNameToEnable) => {
      if (
        layerNameToEnable !== LAYER_NAMES[2] &&
        !layerNameToEnable.startsWith("gc2_io_dk")
      )
        switchLayer.init(layerNameToEnable, false);
    });

    let filter = {
      match: "all",
      columns: [
        {
          fieldname: "count",
          expression: ">",
          value: parameters.selectedMeasurementCount,
          restriction: false,
        },
        {
          fieldname: "startdate",
          expression: ">",
          value: parameters.selectedStartDate,
          restriction: false,
        },
        {
          fieldname: "enddate",
          expression: "<",
          value: parameters.selectedEndDate,
          restriction: false,
        },
      ],
    };

    let filters = {};
    for (let i = 0; i < parameters.layers.length; i++) {
      if (parameters.layers[i] === LAYER_NAMES[0]) {
        if (!parameters.chemical) return;
        let rasterToEnable = `systemx._${parameters.chemical}`;
        currentRasterLayer = rasterToEnable;
        filters[rasterToEnable] = filter;
        layerTree.applyFilters(filters);
        switchLayer.init(rasterToEnable, true);
      } else {
        if (parameters.filters) {
          layerTree.applyFilters(parameters.filters);
        }
        switchLayer.init(parameters.layers[i], true);
      }
    }

    enabledLoctypeIds = [];

    // Wait a bit with trigger state, so this
    setTimeout(() => {
      backboneEvents.get().trigger(`${MODULE_NAME}:enabledLoctypeIdsChange`);
    }, 1500);
  },

  /**
   * Open module menu modal dialog
   *
   * @returns {void}
   */
  openMenuModal: (open = true) => {
    const onCloseHandler = () => {
      $("#watsonc-menu-dialog").modal("hide");
    };

    const introlModalPlaceholderId = `watsonc-intro-modal-placeholder`;
    if ($(`#${introlModalPlaceholderId}`).is(`:empty`)) {
      try {
        /* ReactDOM.render(<Provider store={reduxStore}>
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
                            /></Provider>, document.getElementById(introlModalPlaceholderId)); */
        ReactDOM.render(
          <Provider store={reduxStore}>
            <ThemeProvider>
              <DataSelectorDialogue
                titleText={__("Velkommen til Calypso")}
                urlparser={urlparser}
                anchor={anchor}
                backboneEvents={backboneEvents}
                categories={categoriesOverall ? categoriesOverall : []}
                onApply={_self.onApplyLayersAndChemical}
                onCloseButtonClick={onCloseHandler}
                state={state}
              />
            </ThemeProvider>
          </Provider>,
          document.getElementById(introlModalPlaceholderId)
        );
      } catch (e) {
        console.error(e);
      }
    }

    if (open) {
      $("#watsonc-menu-dialog").modal({
        backdrop: `static`,
      });
    }
  },
  createModal: (
    features,
    plots = false,
    titleAsLink = null,
    setTitle = true
  ) => {
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
      features.map((item) => {
        let title = utils.getMeasurementTitle(item);
        if (titleAsLink) {
          let link = `http://data.geus.dk/JupiterWWW/borerapport.jsp?dgunr=${encodeURIComponent(
            item.properties.boreholeno
          )}`;
          titles.push(
            `<a href="${link}" target="_blank" title="${title} @ data.geus.dk">${title}</a>`
          );
        } else {
          titles.push(`${title}`);
        }
      });

      if (setTitle === true) {
        if (titles.length === 1) {
          $("#" + FEATURE_CONTAINER_ID)
            .find(`.modal-title`)
            .html(titles[0]);
        } else {
          $("#" + FEATURE_CONTAINER_ID)
            .find(`.modal-title`)
            .html(`${__(`Boreholes`)} (${titles.join(`, `)})`);
        }
      } else {
        $("#" + FEATURE_CONTAINER_ID)
          .find(`.modal-title`)
          .html("");
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
      plots.map((plot) => {
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
      plot.measurements.map((measurement) => {
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
      plots.map((plot) => {
        let localParticipatingIds = _self.participatingIds(plot);
        participatingIds = participatingIds.concat(localParticipatingIds);
      });

      _self.highlightFeatures(participatingIds);
    } else {
      let activeLayers = layerTree.getActiveLayers();
      activeLayers.map((activeLayerKey) => {
        _self.displayChemicalSymbols(activeLayerKey);
      });
    }
  },

  highlightFeatures(participatingIds) {
    let mapLayers = layers.getMapLayers();
    mapLayers.map((layer) => {
      if (
        [LAYER_NAMES[0], LAYER_NAMES[1]].indexOf(layer.id) > -1 &&
        layer._layers
      ) {
        for (let key in layer._layers) {
          let featureLayer = layer._layers[key];
          if (
            featureLayer.feature &&
            featureLayer.feature.properties &&
            featureLayer.feature.properties.boreholeno
          ) {
            let icon = L.icon({
              iconUrl:
                "data:image/svg+xml;base64," +
                btoa(
                  getSymbol(layer.id, {
                    online: featureLayer.feature.properties.status,
                    shape: featureLayer.feature.properties.loctypeid,
                    highlighted:
                      participatingIds.indexOf(
                        featureLayer.feature.properties.boreholeno
                      ) > -1,
                  })
                ),
              iconAnchor: [8, 33],
              watsoncStatus:
                participatingIds.indexOf(
                  featureLayer.feature.properties.boreholeno
                ) > -1
                  ? `highlighted`
                  : `default`,
            });

            if (icon && `setIcon` in featureLayer) {
              // Do not set icon if the existing one is the same as the new one
              let statusOfExistingIcon =
                `watsoncStatus` in featureLayer.options.icon.options
                  ? featureLayer.options.icon.options.watsoncStatus
                  : false;
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
    stores[LAYER_NAMES[1]].layer.eachLayer(function (layer) {
      let feature = layer.feature;
      let html = [];
      html.push(`${feature.properties.mouseover}`);
      layer.bindTooltip(`${html.join("<br>")}`);
    });
  },

  bindToolTipOnPesticidoverblik() {
    let stores = layerTree.getStores();
    stores[LAYER_NAMES[3]].layer.eachLayer(function (layer) {
      let feature = layer.feature;
      layer.bindTooltip(feature.properties.html_mouseover);
    });
  },

  displayChemicalSymbols(storeId) {
    let stores = layerTree.getStores();
    let participatingIds = [];
    if (dashboardComponentInstance) {
      let plots = dashboardComponentInstance.getPlots();
      plots.map((plot) => {
        participatingIds = participatingIds.concat(
          _self.participatingIds(plot)
        );
      });
    }

    if (stores[storeId]) {
      stores[storeId].layer.eachLayer(function (layer) {
        let feature = layer.feature;
        if (
          "maxvalue" in feature.properties &&
          "latestvalue" in feature.properties
        ) {
          let html = [];
          // html.push(`
          //     Historisk: ${!feature.properties.maxlimit ? "< " : ""} ${feature.properties.maxvalue}<br>
          //     Seneste: ${!feature.properties.latestlimit ? "< " : ""} ${feature.properties.latestvalue}<br>`);
          html.push(`
                        Historisk: ${feature.properties.maxvalue}<br>
                        Seneste: ${feature.properties.latestvalue}<br>`);

          layer.bindTooltip(`<p><a target="_blank" href="https://data.geus.dk/JupiterWWW/borerapport.jsp?dgunr=${
            feature.properties.boreholeno
          }">${feature.properties.boreholeno}</a></p>
                    <b style="color: rgb(16, 174, 140)">${
                      names[lastSelectedChemical]
                    }</b><br>${html.join("<br>")}`);
        }
      });
    }
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

  /**
   * Returns current module state
   */
  getState: () => {
    let sources = [];

    const boreholeFeatureClone = JSON.parse(
      JSON.stringify(reduxStore.getState().global.boreholeFeatures)
    );
    boreholeFeatureClone.map((i) => {
      let p = {};
      p.properties = {};
      p.properties.loc_id = i.properties.loc_id;
      p.properties.gid = i.properties.gid;
      p.properties.locname = i.properties.locname;
      p.properties.relation = i.properties.relation;
      sources.push(p);
    });

    let dashboardItemsClone = JSON.parse(
      JSON.stringify(dashboardComponentInstance.getDashboardItems())
    );
    //debugger
    return (state = {
      dashboardItems: dashboardItemsClone
        .map((e) => e.item)
        .map((o) => {
          if (o?.profile?.data?.data) delete o.profile.data.data;
          if (o?.measurementsCachedData) delete o.measurementsCachedData;
          return o;
        }),
      sources: sources,
      debug: true,
    });
  },

  /**
   * Applies externally provided state
   */
  applyState: (newState) => {
    setTimeout(() => {
      reduxStore.dispatch(clearBoreholeFeatures());
      if (newState?.sources) {
        newState.sources.forEach((feature) => {
          reduxStore.dispatch(addBoreholeFeature(feature));
        });
      }

      async function fetchTimeSeries(loc_id, relation) {
        return await fetch(
          `/api/sql/jupiter?q=SELECT * FROM ${relation} WHERE loc_id='${loc_id}'&base64=false&lifetime=60&srs=4326`
        );
      }
      async function fetchProfile(key) {
        return await fetch(`/api/key-value/jupiter/${key}`);
      }

      async function loop() {
        let allPlots = [];
        if (!newState.dashboardItems) return allPlots;
        for (let u = 0; u < newState.dashboardItems.length; u++) {
          let plot = newState.dashboardItems[u];
          if (!!plot?.id) {
            let plotData = {
              id: plot.id,
              title: plot.title,
              aggregate: plot.aggregate,
              measurements: [],
              measurementsCachedData: {},
              relations: {},
            };
            for (let i = 0; i < plot.measurements.length; i++) {
              const loc_id = plot.measurements[i].split(":")[0];
              const index = plot.measurements[i].split(":")[2];
              const measurement = loc_id + ":_0:" + index;
              const relation = plot.relations[measurement];
              const res = await fetchTimeSeries(loc_id, relation);
              const json = await res.json();
              if (json && json.features && json.features.length > 0) {
                const props = json.features[0].properties;
                plotData.measurements.push(measurement);
                plotData.relations[measurement] = relation;
                plotData.measurementsCachedData[measurement] = {
                  data: {
                    properties: {
                      _0: JSON.stringify({
                        unit: props.unit[i],
                        title: props.ts_name[i],
                        locname: props.locname,
                        intakes: [1],
                        boreholeno: loc_id,
                        data: props.data,
                        trace: props.trace,
                        parameter: props.parameter[i],
                        ts_id: props.ts_id,
                        ts_name: props.ts_name,
                      }),
                      boreholeno: loc_id,
                      numofintakes: 1,
                    },
                  },
                };
              }
            }
            allPlots.push(plotData);
          } else {
            const res = await fetchProfile(plot.key);
            const json = await res.json();
            plot.profile.data = JSON.parse(json.data.value).profile.data;
            allPlots.push(plot);
          }
        }
        return allPlots;
      }

      loop()
        .then((plots) => {
          useDashboardStore.getState().setDashboardItems(
            plots.map((plot, index) => {
              return {
                type: plot.id ? 0 : 1,
                item: plot,
                plotsIndex: index,
              };
            })
          );
        })
        .catch((e) => {
          console.log("error", e);
        });
    }, 2000);
  },
};
