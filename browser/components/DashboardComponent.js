import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import reduxStore from "./../redux/store";
import { setDashboardMode } from "./../redux/actions";
import {
  SELECT_CHEMICAL_DIALOG_PREFIX,
  TEXT_FIELD_DIALOG_PREFIX,
  VIEW_MATRIX,
  VIEW_ROW,
} from "./../constants";
import PlotManager from "./../PlotManager";
import ProfileManager from "./../ProfileManager";
import TextFieldModal from "./TextFieldModal";
import arrayMove from "array-move";
import trustedIpAddresses from "../trustedIpAddresses";
import { getPlotData } from "../services/plot";
import ProjectContext from "../contexts/project/ProjectContext";
import { type } from "jquery";
import { useDashboardStore } from "../zustand/store";

const uuidv1 = require("uuid/v1");
const session = require("./../../../session/browser/index");

const DASHBOARD_ITEM_PLOT = 0;
const DASHBOARD_ITEM_PROJECT_PLOT = 3;
const DASHBOARD_ITEM_PROFILE = 1;
const DASHBOARD_ITEM_PROJECT_PROFILE = 2;

const DISPLAY_MIN = 0;
const DISPLAY_HALF = 1;
const DISPLAY_MAX = 2;
let currentDisplay = DISPLAY_HALF,
  previousDisplay = DISPLAY_MAX;

let modalHeaderHeight = 70;

let _self = false,
  resizeTimeout = false;

/**
 * Component creates plots management form and is the source of truth for plots overall
 */
class DashboardComponent extends React.Component {
  static contextType = ProjectContext;

  constructor(props) {
    super(props);
    let license = session.getProperties()?.["license"];

    let dashboardItems = [];
    if (this.props.initialPlots) {
      this.props.initialPlots.map((item) => {
        dashboardItems.push({
          type: DASHBOARD_ITEM_PLOT,
          item,
        });
      });
    }

    this.state = {
      view: VIEW_MATRIX,
      newPlotName: ``,
      dashboardItems: useDashboardStore.getState().dashboardItems,
      plots: this.props.initialPlots,
      projectPlots: [],
      profiles: [],
      projectProfiles: [],
      activePlots: [],
      activeProfiles: [],
      dataSource: [],
      highlightedPlot: false,
      createdProfileChemical: false,
      createdProfileName: false,
      lastUpdate: false,
      license: license,
      modalScroll: {},
    };

    this.plotManager = new PlotManager();
    this.profileManager = new ProfileManager();

    // this.handleHighlightPlot = this.handleHighlightPlot.bind(this);

    this.handleShowProfile = this.handleShowProfile.bind(this);
    this.handleHideProfile = this.handleHideProfile.bind(this);
    this.handleCreateProfile = this.handleCreateProfile.bind(this);
    this.handleAddProfile = this.handleAddProfile.bind(this);
    this.handleDeleteProfile = this.handleDeleteProfile.bind(this);
    this.handleProfileClick = this.handleProfileClick.bind(this);
    this.handleChangeDatatypeProfile =
      this.handleChangeDatatypeProfile.bind(this);
    this.getDashboardItems = this.getDashboardItems.bind(this);
    this.setdashboardItems = this.setDashboardItems.bind(this);
    this.handlePlotSort = this.handlePlotSort.bind(this);
    this.getLicense = this.getLicense.bind(this);

    this.setModalScroll = this.setModalScroll.bind(this);
    this.getModalScroll = this.getModalScroll.bind(this);

    _self = this;
  }

  UNSAFE_componentWillMount() {
    $(window).resize(function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        _self.setState({ lastUpdate: new Date() });
      }, 500);
    });

    this.props.backboneEvents
      .get()
      .on(`session:authChange`, (authenticated) => {
        if (authenticated) {
        } else {
          let newDashboardItems = [];
          _self.state.dashboardItems.map((item) => {
            if (
              item.type === DASHBOARD_ITEM_PLOT ||
              item.type === DASHBOARD_ITEM_PROJECT_PLOT
            ) {
              newDashboardItems.push(JSON.parse(JSON.stringify(item)));
            }
          });

          _self.setState({
            profiles: [],
            activeProfiles: [],
            dashboardItems: newDashboardItems,
          });
        }
      });
  }

  componentDidMount() {
    // this.nextDisplayType();
    this.profileManager.getAll().then((response) => {
      this.setState({ profiles: response });
      this.props.setProfiles({ profiles: response });
    });
    this.props.backboneEvents.get().on("refresh:meta", () => {
      this.profileManager.getAll().then((response) => {
        this.setState({ profiles: response });
        this.props.setProfiles({ profiles: response });
      });
    });

    this.unsub = useDashboardStore.subscribe((state) => {
      this.setState({ dashboardItems: state.dashboardItems });
    });
  }

  componentWillUnmount() {
    this.unsub();
  }

  getLicense() {
    return session.getProperties()?.["license"];
  }

  getModalScroll() {
    return this.state.modalScroll;
  }

  setModalScroll(modalScroll) {
    this.setState({ modalScroll });
  }

  getProfiles() {
    let allProfiles = [];
    this.state.projectProfiles.map((item) => {
      item.fromProject = true;
      allProfiles.push(item);
    });
    this.state.profiles.map((item) => {
      allProfiles.push(item);
    });
    allProfiles = allProfiles.sort((a, b) => b["created_at"] - a["created_at"]);
    return allProfiles;
  }

  getActiveProfiles() {
    return JSON.parse(JSON.stringify(this.state.activeProfiles));
  }

  getActiveProfileObjects() {
    let activeProfiles = this.getProfiles().filter((item) => {
      if (this.state.activeProfiles.indexOf(item.key) !== -1) {
        return item;
      }
    });
    return JSON.parse(JSON.stringify(activeProfiles));
  }

  handleCreateProfile(data, activateOnCreate = true, callback = false) {
    _self.profileManager
      .create(data)
      .then((newProfile) => {
        let profilesCopy = JSON.parse(JSON.stringify(_self.state.profiles));
        profilesCopy.unshift(newProfile);

        if (activateOnCreate) {
          let activeProfilesCopy = JSON.parse(
            JSON.stringify(_self.state.activeProfiles)
          );
          if (activeProfilesCopy.indexOf(newProfile.key) === -1)
            activeProfilesCopy.push(newProfile.key);

          let dashboardItemsCopy = JSON.parse(
            JSON.stringify(_self.state.dashboardItems)
          );
          dashboardItemsCopy.push({
            type: DASHBOARD_ITEM_PROFILE,
            item: newProfile,
          });

          _self.setState({
            profiles: profilesCopy,
            dashboardItems: dashboardItemsCopy,
            activeProfiles: activeProfilesCopy,
          });

          _self.props.onActiveProfilesChange(
            activeProfilesCopy,
            profilesCopy,
            _self.context
          );
        } else {
          _self.setState({ profiles: profilesCopy });
        }

        if (callback) callback();

        _self.props.onProfilesChange(_self.getProfiles());
      })
      .catch((error) => {
        console.error(`Error occured while creating profile (${error})`);
        alert(`Error occured while creating profile (${error})`);
        if (callback) callback();
      });
  }

  handleChangeDatatypeProfile(profileKey) {
    let selectedProfile = false;
    this.getProfiles().map((item) => {
      if (item.key === profileKey) {
        selectedProfile = item;
      }
    });

    if (selectedProfile === false)
      throw new Error(`Unable to find the profile with key ${profileKey}`);

    this.setState({ createdProfileChemical: false }, () => {
      const abortDataTypeChange = () => {
        this.setState({ createdProfileChemical: false });
        $("#" + SELECT_CHEMICAL_DIALOG_PREFIX).modal("hide");
      };

      const uniqueKey = uuidv1();

      try {
        ReactDOM.render(
          <div key={`tmp_key_chemical_${uniqueKey}`}>
            <Provider store={reduxStore}>
              <ChemicalSelectorModal
                useLocalSelectedChemical={true}
                localSelectedChemical={this.state.selectedChemical}
                onClickControl={(selectorValue) => {
                  this.setState(
                    { createdProfileChemical: selectorValue },
                    () => {
                      try {
                        ReactDOM.render(
                          <div key={`tmp_key_text_${uniqueKey}`}>
                            <TextFieldModal
                              title={__(`Enter the name of created profile`)}
                              onClickControl={(title) => {
                                $.snackbar({
                                  id: "snackbar-watsonc",
                                  content:
                                    "<span id='conflict-progress'>" +
                                    __(
                                      "The profile with the new datatype is being created"
                                    ) +
                                    "</span>",
                                  htmlAllowed: true,
                                  timeout: 1000000,
                                });

                                this.handleCreateProfile(
                                  {
                                    title,
                                    profile: selectedProfile.value.profile,
                                    buffer: selectedProfile.value.buffer,
                                    depth: selectedProfile.value.depth,
                                    compound: this.state.createdProfileChemical,
                                    boreholeNames:
                                      selectedProfile.value.boreholeNames,
                                    layers: selectedProfile.value.layers,
                                  },
                                  true,
                                  () => {
                                    this.setState(
                                      { createdProfileChemical: false },
                                      () => {
                                        jquery("#snackbar-watsonc").snackbar(
                                          "hide"
                                        );
                                      }
                                    );
                                  }
                                );
                              }}
                              onCancelControl={abortDataTypeChange}
                            />
                          </div>,
                          document.getElementById(
                            `${TEXT_FIELD_DIALOG_PREFIX}-placeholder`
                          )
                        );
                      } catch (e) {
                        console.error(e);
                      }

                      $("#" + TEXT_FIELD_DIALOG_PREFIX).modal({
                        backdrop: `static`,
                      });
                    }
                  );

                  $("#" + SELECT_CHEMICAL_DIALOG_PREFIX).modal("hide");
                }}
                onCancelControl={abortDataTypeChange}
              />
            </Provider>
          </div>,
          document.getElementById(
            `${SELECT_CHEMICAL_DIALOG_PREFIX}-placeholder`
          )
        );
      } catch (e) {
        console.error(e);
      }

      $("#" + SELECT_CHEMICAL_DIALOG_PREFIX).modal({ backdrop: `static` });
    });
  }

  handleProfileClick(e) {
    if (
      e &&
      e.points &&
      e.points.length === 1 &&
      e.points[0].data &&
      e.points[0].data.text
    ) {
      if (e.points[0].data.text.indexOf(`DGU`) > -1) {
        let boreholeNumber = false;
        let lines = e.points[0].data.text.split(`<br>`);
        lines.map((item) => {
          if (item.indexOf(`DGU`) > -1) {
            boreholeNumber = item
              .replace(`DGU`, ``)
              .replace(/>/g, ``)
              .replace(/</g, ``)
              .replace(/b/g, ``)
              .replace(/\//g, ``)
              .trim();
          }
        });
        if (boreholeNumber !== false) {
          this.props.onOpenBorehole(boreholeNumber);
        }
      }
    }
  }

  handleDeleteProfile(profileKey, callback = false) {
    this.profileManager
      .delete(profileKey)
      .then(() => {
        var profilesCopy = JSON.parse(JSON.stringify(this.state.profiles));
        let profileWasDeleted = false;
        profilesCopy = profilesCopy.filter((profile) => {
          if (profile.key === profileKey) {
            return false;
          }
          return true;
        });

        if (profileWasDeleted === false) {
          console.warn(
            `Profile ${profileKey} was deleted only from backend storage`
          );
        }

        var dashboardItemsCopy = JSON.parse(
          JSON.stringify(this.state.dashboardItems)
        );
        dashboardItemsCopy = dashboardItemsCopy.filter((item) => {
          if (item.type === DASHBOARD_ITEM_PROFILE) {
            if (item.key === profileKey) {
              return false;
            }
          }
          return true;
        });

        var activeProfilesCopy = JSON.parse(
          JSON.stringify(this.state.activeProfiles)
        );
        activeProfilesCopy = activeProfilesCopy.filter((profile) => {
          if (profile === profileKey) {
            return false;
          }
          return true;
        });

        if (callback) callback();

        this.setState({
          profiles: profilesCopy,
          activeProfiles: activeProfilesCopy,
          dashboardItems: dashboardItemsCopy,
        });
        this.props.onProfilesChange(this.getProfiles());
        this.props.onActiveProfilesChange(
          activeProfilesCopy,
          profilesCopy,
          this.context
        );
      })
      .catch((error) => {
        console.error(`Error occured while deleting profile (${error})`);
      });
  }

  handleShowProfile(profileId) {
    if (!profileId) throw new Error(`Empty profile identifier`);

    let activeProfiles = JSON.parse(JSON.stringify(this.state.activeProfiles));
    if (activeProfiles.indexOf(profileId) === -1)
      activeProfiles.push(profileId);
    this.setState({ activeProfiles }, () => {
      this.props.onActiveProfilesChange(
        this.state.activeProfiles,
        this.state.profiles,
        this.context
      );
    });
  }

  handleAddProfile(profile) {
    let dashboardItemsCopy = [];
    let activeProfiles = [];

    dashboardItemsCopy.push({
      type: DASHBOARD_ITEM_PROFILE,
      item: profile,
    });

    this.state.dashboardItems.forEach((item) => {
      dashboardItemsCopy.push(item);
      if (item.type === DASHBOARD_ITEM_PROFILE) {
        activeProfiles.push(item.item.key);
      }
    });

    activeProfiles.push(profile.key);

    if (reduxStore.getState().global.dashboardMode === "minimized") {
      reduxStore.dispatch(setDashboardMode("half"));
    }

    document.getElementById("chartsContainer").scrollTop = 0;

    this.setState(
      {
        dashboardItems: dashboardItemsCopy,
        activeProfiles: activeProfiles,
      },
      () => {
        this.props.onActiveProfilesChange(
          this.state.activeProfiles,
          this.state.profiles,
          this.context
        );
      }
    );
  }

  handleHideProfile(profileId) {
    if (!profileId) throw new Error(`Empty profile identifier`);

    let activeProfiles = JSON.parse(JSON.stringify(this.state.activeProfiles));
    if (activeProfiles.indexOf(profileId) > -1)
      activeProfiles.splice(activeProfiles.indexOf(profileId), 1);
    this.setState({ activeProfiles }, () => {
      this.props.onActiveProfilesChange(
        this.state.activeProfiles,
        this.state.profiles,
        this.context
      );
    });
  }

  getDashboardItems() {
    return this.state.dashboardItems;
  }

  setDashboardItems(dashboardItems) {
    this.setState({ dashboardItems });
  }

  getPlots() {
    return this.state.dashboardItems
      .filter((dashboardItem) => dashboardItem.type === DASHBOARD_ITEM_PLOT)
      .map((dashboardItem) => dashboardItem.item);
  }

  getActivePlots() {
    return JSON.parse(
      JSON.stringify(
        this.state.dashboardItems
          .filter((dashboardItem) => dashboardItem.type === DASHBOARD_ITEM_PLOT)
          .map((dashboardItem) => dashboardItem.item)
      )
    );
  }

  setProjectPlots(projectPlots) {
    let dashboardItemsCopy = [];
    let plotsNotOnDashboard = [];
    let profilesNotOnDashboard = [];
    const unique = (data, key) => {
      return [...new Map(data.map((item) => [key(item), item])).values()];
    };

    this.state.dashboardItems.map((item) => {
      if (item.type !== DASHBOARD_ITEM_PROJECT_PLOT) {
        dashboardItemsCopy.push(item);
      }
    });

    projectPlots.map((item) => {
      dashboardItemsCopy.push({
        type: DASHBOARD_ITEM_PROJECT_PLOT,
        item,
      });
    });

    dashboardItemsCopy.map((item) => {
      if (typeof item.type !== "undefined" && item.type === 0) {
        plotsNotOnDashboard.push(item.item.id);
      } else if (typeof item.type !== "undefined" && item.type === 3) {
        // Remove an id again if it appears more than once in this.state.dashboardItems
        plotsNotOnDashboard = plotsNotOnDashboard.filter(
          (e) => e !== item.item.id
        );
      }
      if (typeof item.type !== "undefined" && item.type === 1) {
        profilesNotOnDashboard.push(item.item.key);
      } else if (typeof item.type !== "undefined" && item.type === 2) {
        // Remove a key again if it appears more than once in this.state.dashboardItems
        profilesNotOnDashboard = profilesNotOnDashboard.filter(
          (e) => e !== item.item.key
        );
      }
    });

    // Remove duplets
    dashboardItemsCopy = unique(dashboardItemsCopy, (item) => item.item.id);
    this.setState({ projectPlots, dashboardItems: dashboardItemsCopy }, () => {
      setTimeout(() => {
        plotsNotOnDashboard.forEach((id) => this.handleHidePlot(id));
        profilesNotOnDashboard.forEach((id) => this.handleHideProfile(id));
      }, 1000);
    });
  }

  // setActiveProfiles(activeProfiles) {
  //   if (typeof activeProfiles !== "undefined") {
  //     let dashboardItemsCopy = [];
  //     this.state.dashboardItems.map((item) => {
  //       if (
  //         item.type !== DASHBOARD_ITEM_PROFILE /* type 0 */ &&
  //         item.type !== DASHBOARD_ITEM_PROJECT_PLOT /* type 3*/
  //       ) {
  //         dashboardItemsCopy.push(item);
  //       }
  //     });

  //     let profiles = this.getProfiles().filter((elem) =>
  //       activeProfiles.includes(elem.key)
  //     );

  //     profiles.map((item) => {
  //       dashboardItemsCopy.push({
  //         type: DASHBOARD_ITEM_PROFILE,
  //         item,
  //       });
  //     });

  //     this.setState(
  //       { activeProfiles, dashboardItems: dashboardItemsCopy },
  //       () => {
  //         this.props.onActiveProfilesChange(
  //           this.state.activeProfiles,
  //           this.state.profiles,
  //           this.context
  //         );
  //       }
  //     );
  //   }
  // }

  setProfiles(profiles) {
    this.setState(profiles, () => {
      this.props.onProfilesChange(this.getProfiles());
    });
  }

  setPlots(plots) {
    let dashboardItemsCopy = [];
    this.state.dashboardItems.map((item, index) => {
      dashboardItemsCopy.push({
        type: item.type,
        item: item,
        plotsIndex: item.plotsIndex ? item.plotsIndex : index,
      });
    });

    useDashboardStore.getState().setDashboardItems(dashboardItemsCopy);
  }

  setActivePlots(activePlots) {
    this.setState({ activePlots });
  }

  setProjectProfiles(projectProfiles) {
    const unique = (myArr) => {
      return myArr.filter((obj, pos, arr) => {
        return arr.map((mapObj) => mapObj["key"]).indexOf(obj["key"]) === pos;
      });
    };
    // Remove duplets
    projectProfiles = unique(projectProfiles);
    let dashboardItemsCopy = [];
    this.state.dashboardItems.map((item) => {
      if (item.type !== DASHBOARD_ITEM_PROJECT_PROFILE) {
        dashboardItemsCopy.push(item);
      }
    });
    projectProfiles.map((item) => {
      dashboardItemsCopy.push({
        type: DASHBOARD_ITEM_PROJECT_PROFILE,
        item,
      });
      this.handleShowProfile(item.key);
    });
    this.setState({ projectProfiles, dashboardItems: dashboardItemsCopy });
  }

  // getProfilesLength() {
  //   let activeProfiles = [];
  //   this.state.profiles.map((item) => {
  //     if (activeProfiles.indexOf(item.key) === -1) {
  //       activeProfiles.push(item.key);
  //     }
  //   });
  //   this.state.activeProfiles.map((item) => {
  //     if (activeProfiles.indexOf(item.key) === -1) {
  //       activeProfiles.push(item.key);
  //     }
  //   });
  //   return activeProfiles.length;
  // }

  // getPlotsLength() {
  //   return this.state.plots.length + this.state.projectPlots.length;
  // }

  // handleHighlightPlot(plotId) {
  //   if (!plotId) throw new Error(`Empty plot identifier`);

  //   this.setState(
  //     {
  //       highlightedPlot: plotId === this.state.highlightedPlot ? false : plotId,
  //     },
  //     () => {
  //       this.props.onHighlightedPlotChange(
  //         this.state.highlightedPlot,
  //         this.state.plots
  //       );
  //     }
  //   );
  // }

  // handleNewPlotNameChange(event) {
  //   this.setState({ newPlotName: event.target.value });
  // }

  _modifyAxes(
    plotId,
    gid,
    measurementKey,
    measurementIntakeIndex,
    action,
    measurementsData,
    relation
  ) {
    if (!plotId) throw new Error(`Invalid plot identifier`);
    if (
      //Hvordan skal dette forstås?
      (!gid && gid !== 0) ||
      !measurementKey ||
      (!measurementIntakeIndex && measurementIntakeIndex !== 0)
    )
      throw new Error(`Invalid measurement location parameters`);

    let plots = this.getPlots();
    let correspondingPlot = false;
    let correspondingPlotIndex = false;
    plots.map((plot, index) => {
      if (plot.id === plotId) {
        correspondingPlot = plot;
        correspondingPlotIndex = index;
      }
    });

    if (correspondingPlot === false)
      throw new Error(`Plot with id ${plotId} does not exist`);
    let measurementIndex = gid + ":_0:" + measurementIntakeIndex;
    if (action === `add`) {
      if (correspondingPlot.measurements.indexOf(measurementIndex) === -1) {
        let measurementData = this.getFeatureByGidFromDataSource(gid);
        if (measurementsData) {
          measurementData = measurementsData;
        }
        if (measurementData) {
          correspondingPlot.measurements.push(measurementIndex);
          correspondingPlot.measurementsCachedData[measurementIndex] =
            measurementData;
          correspondingPlot.relations[measurementIndex] = relation;
        } else {
          throw new Error(
            `Unable to find data for measurement index ${measurementIndex}`
          );
        }
      }
    } else if (action === `delete`) {
      if (correspondingPlot.measurements.indexOf(measurementIndex) === -1) {
        throw new Error(
          `Unable to find measurement ${measurementIndex} for ${plotId} plot`
        );
      } else {
        if (measurementIndex in correspondingPlot.measurementsCachedData) {
          correspondingPlot.measurements.splice(
            correspondingPlot.measurements.indexOf(measurementIndex),
            1
          );
          delete correspondingPlot.measurementsCachedData[measurementIndex];
        } else {
          throw new Error(
            `Data integrity violation: plot ${plotId} does not contain cached data for measurement ${measurementIndex}`
          );
        }
      }
    } else {
      throw new Error(`Unrecognized action ${action}`);
    }
    plots[correspondingPlotIndex] = correspondingPlot;

    const updated = this.state.dashboardItems.map((dashboardItem) => {
      if (dashboardItem.item.id === correspondingPlot.id) {
        dashboardItem.item = correspondingPlot;
      }
      return dashboardItem;
    });

    useDashboardStore.getState().setDashboardItems(updated);

    this.setState({
      plots,
      projectPlots: plots,
      dashboardItems: updated,
    });
    this.plotManager
      .update(correspondingPlot)
      .then(() => {
        this.props.onPlotsChange(this.getPlots(), this.context);
      })
      .catch((error) => {
        console.error(`Error occured while updating plot (${error})`);
      });
  }

  setDataSource(dataSource) {
    let plots = JSON.parse(JSON.stringify(this.state.plots));
    let updatePlotsPromises = [];
    for (let i = 0; i < plots.length; i++) {
      let plot = plots[i];
      let plotWasUpdatedAtLeastOnce = false;
      if (typeof plot.measurements === "undefined") {
        break;
      }
      plot.measurements.map((measurementIndex) => {
        let splitMeasurementIndex = measurementIndex.split(`:`);
        if (
          splitMeasurementIndex.length !== 3 &&
          splitMeasurementIndex.length !== 4
        )
          throw new Error(`Invalid measurement index`);
        let measurementData = false;
        dataSource.map((item) => {
          if (
            item.properties.boreholeno === parseInt(splitMeasurementIndex[0])
          ) {
            measurementData = item;
            return false;
          }
        });

        if (measurementData) {
          let currentTime = new Date();
          plot.measurementsCachedData[measurementIndex] = {
            data: measurementData,
            created_at: currentTime.toISOString(),
          };

          plotWasUpdatedAtLeastOnce = true;
        }
      });

      if (plotWasUpdatedAtLeastOnce) {
        updatePlotsPromises.push(this.plotManager.update(plot));
      }
    }

    Promise.all(updatePlotsPromises)
      .then(() => {
        let dashboardItemsCopy = JSON.parse(
          JSON.stringify(this.state.dashboardItems)
        );
        dashboardItemsCopy.map((item, index) => {
          if (
            item.type === DASHBOARD_ITEM_PLOT ||
            item.type === DASHBOARD_ITEM_PROJECT_PLOT
          ) {
            plots.map((updatedPlot) => {
              if (item.item.id === updatedPlot.id) {
                dashboardItemsCopy[index].item = updatedPlot;
                return false;
              }
            });
          }
        });

        this.setState({
          dataSource,
          plots,
          dashboardItems: dashboardItemsCopy,
        });
      })
      .catch((errors) => {
        console.error(
          `Unable to update measurement data upon updating the data source`,
          errors
        );
      });
  }

  getFeatureByGidFromDataSource(boreholeno, check = true) {
    if (check === false) {
      throw new Error(`Invalid boreholeno ${boreholeno} was provided`);
    }

    let featureWasFound = false;
    this.state.dataSource.map((item) => {
      if (item.properties.boreholeno === boreholeno) {
        featureWasFound = item;
        return false;
      }
    });

    return featureWasFound;
  }

  addMeasurement(
    plotId,
    gid,
    measurementKey,
    measurementIntakeIndex,
    measurementsData,
    relation
  ) {
    this._modifyAxes(
      plotId,
      gid,
      measurementKey,
      measurementIntakeIndex,
      `add`,
      measurementsData,
      relation
    );
  }

  deleteMeasurement(plotId, gid, measurementKey, measurementIntakeIndex) {
    this._modifyAxes(
      plotId,
      gid,
      measurementKey,
      measurementIntakeIndex,
      `delete`
    );
  }

  handlePlotSort({ oldIndex, newIndex }) {
    this.setState(({ dashboardItems }) => ({
      dashboardItems: arrayMove(dashboardItems, oldIndex, newIndex),
    }));
  }

  onSetMin() {
    $(PLOTS_ID).animate(
      {
        top: $(document).height() - modalHeaderHeight + "px",
      },
      500,
      function () {
        $(PLOTS_ID)
          .find(".modal-body")
          .css(`max-height`, modalHeaderHeight + "px");
      }
    );

    $(".js-expand-less").hide();
    $(".js-expand-half").show();
    $(".js-expand-more").show();
    $(PLOTS_ID + " .modal-body").css(`visibility`, `hidden`);
  }

  onSetHalf() {
    $(PLOTS_ID).animate(
      {
        top: "50%",
      },
      500,
      function () {
        $(PLOTS_ID)
          .find(".modal-body")
          .css(
            `max-height`,
            $(document).height() * 0.5 - modalHeaderHeight - 20 + "px"
          );
      }
    );

    $(".js-expand-less").show();
    $(".js-expand-half").hide();
    $(".js-expand-more").show();
    $(PLOTS_ID + " .modal-body").css(`visibility`, `visible`);
  }

  onSetMax() {
    $(PLOTS_ID).animate(
      {
        top: "10%",
      },
      500,
      function () {
        $(PLOTS_ID)
          .find(".modal-body")
          .css(
            `max-height`,
            $(document).height() * 0.9 - modalHeaderHeight - 10 + "px"
          );
      }
    );

    $(".js-expand-less").show();
    $(".js-expand-half").show();
    $(".js-expand-more").hide();
    $(PLOTS_ID + " .modal-body").css(`visibility`, `visible`);
  }

  nextDisplayType() {
    if (currentDisplay === DISPLAY_MIN) {
      this.onSetHalf();
      currentDisplay = DISPLAY_HALF;
      previousDisplay = DISPLAY_MIN;
    } else if (currentDisplay === DISPLAY_HALF) {
      if (previousDisplay === DISPLAY_MIN) {
        this.onSetMax();
        currentDisplay = DISPLAY_MAX;
      } else {
        this.onSetMin();
        currentDisplay = DISPLAY_MIN;
      }

      previousDisplay = DISPLAY_HALF;
    } else if (currentDisplay === DISPLAY_MAX) {
      this.onSetHalf();
      currentDisplay = DISPLAY_HALF;
      previousDisplay = DISPLAY_MAX;
    }
  }

  render() {
    return <div></div>;
  }
}

DashboardComponent.propTypes = {
  initialPlots: PropTypes.array.isRequired,
  //onOpenBorehole: PropTypes.func.isRequired,
  onPlotsChange: PropTypes.func.isRequired,
  onActivePlotsChange: PropTypes.func.isRequired,
  onHighlightedPlotChange: PropTypes.func.isRequired,
};

export default DashboardComponent;
