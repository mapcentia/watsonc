import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Slider from "rc-slider";
import { Provider } from "react-redux";
import { connect } from "react-redux";

import {
  SELECT_CHEMICAL_DIALOG_PREFIX,
  FREE_PLAN_MAX_PROFILES_COUNT,
} from "./../constants";
import TitleFieldComponent from "./../../../../browser/modules/shared/TitleFieldComponent";
import LoadingOverlay from "./../../../../browser/modules/shared/LoadingOverlay";
import SearchFieldComponent from "./../../../../browser/modules/shared/SearchFieldComponent";

import reduxStore from "./../redux/store";

import { selectChemical } from "./../redux/actions";
import ChemicalSelectorModal from "./dataselector/ChemicalSelectorModal";
import ThemeProvider from "../themes/ThemeProvider";
import { showSubscription } from "../helpers/show_subscriptionDialogue";

const utils = require("./../utils");

const wkt = require("terraformer-wkt-parser");
const utmZone = require("./../../../../browser/modules/utmZone");
const session = require("./../../../session/browser/index");

const STEP_ENTER_NAME = -1;
const STEP_NOT_READY = 0;
const STEP_BEING_DRAWN = 1;
const STEP_READY_TO_LOAD = 2;
const STEP_CHOOSE_LAYERS = 3;

const DEFAULT_API_URL = `/api/key-value`;

let drawnItems = new L.FeatureGroup(),
  displayedItems = new L.FeatureGroup(),
  embedDrawControl = false;

/**
 * Component for creating profiles
 */
class MenuProfilesComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      apiUrl: props.apiUrl ? props.apiUrl : DEFAULT_API_URL,
      loading: false,
      localSelectedChemical: false,
      showDrawingForm: true,
      showExistingProfiles: true,
      showProjectProfiles: true,
      boreholeNames: [],
      layers: [],
      selectedLayers: [],
      authenticated: props.authenticated ? props.authenticated : false,
      profiles: props.initialProfiles ? props.initialProfiles : [],
      activeProfiles: props.initialActiveProfiles
        ? props.initialActiveProfiles
        : [],
      profile: false,
      step: STEP_ENTER_NAME,
      bufferedProfile: false,
      profileBottom: -100,
      buffer: 100,
      newTitle: "",
      profilesSearchTerm: "",
    };

    this.search = this.search.bind(this);
    this.startDrawing = this.startDrawing.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.handleLayerSelect = this.handleLayerSelect.bind(this);

    props.cloud.get().map.addLayer(drawnItems);
    props.cloud.get().map.addLayer(displayedItems);

    this.bufferSliderRef = React.createRef();
    this.bufferValueRef = React.createRef();
    this.onNewProfileAdd = this.onNewProfileAdd.bind(this);
    this.canCreateProfile = this.canCreateProfile.bind(this);

    window.menuProfilesComponentInstance = this;
  }

  componentDidMount() {
    let _self = this;
    this.props.backboneEvents
      .get()
      .on(`session:authChange`, (authenticated) => {
        if (_self.state.authenticated !== authenticated) {
          _self.setState({ authenticated });
        }
      });

    this.displayActiveProfiles();
  }

  canCreateProfile() {
    if (session.getProperties()?.["license"] === "premium") {
      return true;
    } else {
      return this.getProfilesLength() < FREE_PLAN_MAX_PROFILES_COUNT;
    }
  }

  displayActiveProfiles() {
    displayedItems.eachLayer((layer) => {
      displayedItems.removeLayer(layer);
    });

    if (this.state.activeProfiles) {
      this.state.activeProfiles.map((activeProfileKey) => {
        this.state.profiles.map((profile) => {
          if (profile.key === activeProfileKey) {
            this.displayProfile(profile);
          }
        });
      });
    }
  }

  setProfiles(profiles) {
    this.setState({ profiles });
  }

  setActiveProfiles(activeProfiles) {
    this.setState({ activeProfiles });
  }

  onNewProfileAdd(newTitle) {
    if (!this.canCreateProfile()) {
      showSubscription();
      return;
    }
    this.setState({ newTitle, step: STEP_NOT_READY });
  }

  getProjectProfilesLength() {
    let count = 0;
    this.state.profiles.map((item) => {
      if (item.fromProject) {
        count += 1;
      }
    });
    return count;
  }

  getProfilesLength() {
    let count = 0;
    this.state.profiles.map((item) => {
      if (!item.fromProject) {
        count += 1;
      }
    });
    return count;
  }

  saveProfile() {
    let layers = [];
    this.state.layers.map((item) => {
      if (this.state.selectedLayers.indexOf(item.id) > -1) {
        layers.push(item);
      }
    });

    this.setState({ loading: true });
    this.props.onProfileCreate(
      {
        title: this.state.newTitle,
        profile: this.state.profile,
        buffer: this.state.buffer,
        depth: this.state.profileBottom,
        compound: this.state.localSelectedChemical,
        boreholeNames: this.state.boreholeNames,
        layers,
      },
      true,
      () => {
        this.setState({
          step: STEP_ENTER_NAME,
          bufferedProfile: false,
          profileBottom: -100,
          buffer: 100,
          newTitle: "",
          loading: false,
        });
      }
    );
  }

  handleProfileDelete(item) {
    if (confirm(__(`Delete`) + " " + item.profile.title + "?")) {
      this.setState({ loading: true });
      this.props.onProfileDelete(item.key, () => {
        this.setState({ loading: false });
      });
    }
  }

  handleLayerSelect(checked, layer) {
    let layesrCopy = JSON.parse(JSON.stringify(this.state.selectedLayers));
    if (checked) {
      if (layesrCopy.indexOf(layer.id) === -1) {
        layesrCopy.push(layer.id);
      }
    } else {
      if (layesrCopy.indexOf(layer.id) > -1) {
        layesrCopy.splice(layesrCopy.indexOf(layer.id), 1);
      }
    }

    this.setState({ selectedLayers: layesrCopy });
  }

  search() {
    this.setState(
      {
        step: STEP_NOT_READY,
        layers: [],
        selectedLayers: [],
      },
      () => {
        this.stopDrawing();
        this.setState({ loading: true });
        axios
          .post(
            `https://calypso_beta.watsonc.dk/api/extension/watsonc/intersection`,
            {
              data: wkt.convert(this.state.bufferedProfile),
              bufferRadius: this.state.buffer,
              profileDepth: this.state.profileBottom,
              profile: this.state.profile,
            }
          )
          .then((response) => {
            let responseCopy = JSON.parse(JSON.stringify(response.data.result));
            response.data.result.map((item, index) => {
              responseCopy[index].id = btoa(item.title);
            });

            this.setState({
              step: STEP_CHOOSE_LAYERS,
              loading: false,
              layers: responseCopy,
              boreholeNames: response.data.boreholeNames,
            });
          })
          .catch((error) => {
            this.setState({ loading: false });
            console.log(`Error occured`, error);
          });
      }
    );
  }

  clearDrawnLayers() {
    drawnItems.eachLayer((layer) => {
      drawnItems.removeLayer(layer);
    });
  }

  startDrawing() {
    this.clearDrawnLayers();

    if (embedDrawControl) embedDrawControl.disable();
    embedDrawControl = new L.Draw.Polyline(this.props.cloud.get().map);
    embedDrawControl.enable();

    embedDrawControl._map.off("draw:created");
    embedDrawControl._map.on("draw:created", (e) => {
      if (embedDrawControl) embedDrawControl.disable();

      let coord,
        layer = e.layer;

      let primitive = layer.toGeoJSON();
      if (primitive) {
        if (typeof layer.getBounds !== "undefined") {
          coord = layer.getBounds().getSouthWest();
        } else {
          coord = layer.getLatLng();
        }

        // Get utm zone
        var zone = utmZone.getZone(coord.lat, coord.lng);
        var crss = {
          proj:
            "+proj=utm +zone=" +
            zone +
            " +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
          unproj: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
        };

        var reader = new jsts.io.GeoJSONReader();
        var writer = new jsts.io.GeoJSONWriter();
        var geom = reader.read(
          reproject.reproject(primitive, "unproj", "proj", crss)
        );
        var buffer4326 = reproject.reproject(
          writer.write(geom.geometry.buffer(this.state.buffer)),
          "proj",
          "unproj",
          crss
        );

        L.geoJson(buffer4326, {
          color: "#ff7800",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.1,
          dashArray: "5,3",
        }).addTo(drawnItems);

        this.setState({
          step: STEP_READY_TO_LOAD,
          bufferedProfile: buffer4326,
          profile: primitive,
        });
      }
    });
  }

  stopDrawing() {
    if (drawnItems) drawnItems.clearLayers();
    if (embedDrawControl) embedDrawControl.disable();
  }

  displayProfile(data) {
    this.clearDrawnLayers();
    let profile = data.profile.profile;

    // Get utm zone
    var zone = utmZone.getZone(
      profile.geometry.coordinates[0][1],
      profile.geometry.coordinates[0][0]
    );
    var crss = {
      proj:
        "+proj=utm +zone=" +
        zone +
        " +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
      unproj: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    };

    let reader = new jsts.io.GeoJSONReader();
    let writer = new jsts.io.GeoJSONWriter();
    let geom = reader.read(
      reproject.reproject(profile, "unproj", "proj", crss)
    );
    let buffer4326 = reproject.reproject(
      writer.write(geom.geometry.buffer(data.profile.buffer)),
      "proj",
      "unproj",
      crss
    );

    L.geoJson(buffer4326, {
      color: "#ff7800",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.1,
      dashArray: "5,3",
    }).addTo(displayedItems);

    var profileLayer = new L.geoJSON(profile);

    profileLayer.bindTooltip(data.profile.title, {
      className: "watsonc-profile-tooltip",
      permanent: true,
      offset: [0, 0],
    });

    profileLayer.addTo(displayedItems);
  }

  handleProfileToggle(checked, profileKey) {
    if (checked) {
      this.props.onProfileShow(profileKey);
    } else {
      this.props.onProfileHide(profileKey);
    }
  }

  addToDashboard(item) {
    this.props.onProfileAdd(item);
  }

  render() {
    let overlay = false;
    if (this.state.loading) {
      overlay = <LoadingOverlay />;
    }

    let availableLayers = (
      <div style={{ textAlign: `center` }}>
        <p>{__(`No layers found`)}</p>
      </div>
    );

    if (this.state.layers && this.state.layers.length > 0) {
      availableLayers = [];

      const generateLayerRecord = (item, index, prefix) => {
        let points = [];
        item.intersectionSegments.map((item) => {
          points.push(
            `${Math.round(item[0] / 1000)}km - ${Math.round(item[1] / 1000)}km`
          );
        });

        return (
          <div className="form-group" key={`${prefix}${index}`}>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.state.selectedLayers.indexOf(item.id) > -1}
                  onChange={(event) => {
                    this.handleLayerSelect(event.target.checked, item);
                  }}
                />{" "}
                {item.title}
              </label>
            </div>
            <div>
              {item.subtitle}
              <br />
              {__(`Stationing points`) + ": " + points.join(", ")}
            </div>
          </div>
        );
      };

      this.state.layers
        .filter((item) => item.type !== `geology`)
        .map((item, index) => {
          availableLayers.push(
            generateLayerRecord(item, index, `non_geology_layer_`)
          );
        });
      if (availableLayers.length > 0)
        availableLayers.push(
          <hr style={{ margin: `10px` }} key={`layer_divider`} />
        );
      this.state.layers
        .filter((item) => item.type === `geology`)
        .map((item, index) => {
          availableLayers.push(
            generateLayerRecord(item, index, `geology_layer_`)
          );
        });
    }

    let existingProfilesControls = (
      <div style={{ textAlign: `center` }}>
        <p>{__(`No profiles found`)}</p>
      </div>
    );
    let projectProfilesControls = (
      <div style={{ textAlign: `center` }}>
        <p>{__(`No profiles found`)}</p>
      </div>
    );

    let plotRows = [];
    let projectProfileRows = [];
    this.state.profiles.map((item, index) => {
      if (this.state.profilesSearchTerm.length > 0) {
        if (
          item.profile.title
            .toLowerCase()
            .indexOf(this.state.profilesSearchTerm.toLowerCase()) === -1
        ) {
          return;
        }
      }
      var deleteButton = item.fromProject ? null : (
        <td style={{ textAlign: `right` }}>
          <button
            type="button"
            className="btn btn-xs btn-primary"
            title={__(`Delete profile`)}
            onClick={(event) => {
              this.handleProfileDelete(item);
            }}
            style={{ padding: `4px`, margin: `0px` }}
          >
            <i className="material-icons">delete</i>
          </button>
        </td>
      );
      var itemHtml = (
        <tr key={`existing_profile_${index}`}>
          <td>
            <div>
              <div style={{ float: `left` }}>
                <button
                  type="button"
                  name="enabled_profile"
                  className="btn btn-xs btn-primary"
                  title="Tilføj profil"
                  // checked={this.state.activeProfiles.indexOf(item.key) > -1}
                  onClick={() => this.addToDashboard(item)}
                  // onChange={(event) => {
                  //     this.handleProfileToggle(event.target.checked, item.key);
                  // }}
                  style={{ padding: `0px`, margin: `0px` }}
                >
                  <i className="material-icons">add</i>
                </button>
              </div>
              <div
                style={{ float: `left`, paddingLeft: `8px`, paddingTop: `2px` }}
              >
                {item.profile.title}
              </div>
            </div>
          </td>
          <td style={{ textAlign: `center` }}>
            {item.profile.compound
              ? utils.getChemicalName(
                  item.profile.compound,
                  this.props.categories
                )
              : "Ikke valgt"}
          </td>
          {deleteButton}
        </tr>
      );
      if (item.fromProject === true) {
        projectProfileRows.push(itemHtml);
      } else {
        plotRows.push(itemHtml);
      }
    });

    if (plotRows.length > 0) {
      existingProfilesControls = (
        <table className="table table-striped">
          <thead style={{ color: `rgb(0, 150, 136)` }}>
            <tr>
              <th>
                <div style={{ float: `left` }}>
                  <i
                    style={{ fontSize: `20px` }}
                    className="material-icons"
                    title={__(`Add to the dashboard`)}
                  >
                    grid_on
                  </i>
                </div>
                <div style={{ float: `left`, paddingLeft: `10px` }}>
                  {__(`Title`)}
                </div>
              </th>
              <th style={{ textAlign: `center` }}>{__(`Datatype`)}</th>
              <th style={{ textAlign: `right`, paddingRight: `10px` }}>
                <i
                  style={{ fontSize: `20px` }}
                  className="material-icons"
                  title={__(`Delete`)}
                >
                  delete
                </i>
              </th>
            </tr>
          </thead>
          <tbody>{plotRows}</tbody>
        </table>
      );
    }

    if (projectProfileRows.length > 0) {
      projectProfilesControls = (
        <table className="table table-striped">
          <thead style={{ color: `rgb(0, 150, 136)` }}>
            <tr>
              <th>
                <div style={{ float: `left` }}>
                  <i
                    style={{ fontSize: `20px` }}
                    className="material-icons"
                    title={__(`Add to the dashboard`)}
                  >
                    grid_on
                  </i>
                </div>
                <div style={{ float: `left`, paddingLeft: `10px` }}>
                  {__(`Title`)}
                </div>
              </th>
              <th style={{ textAlign: `center` }}>{__(`Datatype`)}</th>
            </tr>
          </thead>
          <tbody>{projectProfileRows}</tbody>
        </table>
      );
    }

    let chemicalName = "Ikke valgt";
    if (this.state.localSelectedChemical) {
      chemicalName = utils.getChemicalName(
        this.state.localSelectedChemical,
        this.props.categories
      );
    }

    let renderText = "";
    if (this.state.authenticated) {
      renderText = (
        <div id="profile-drawing-buffer" style={{ position: `relative` }}>
          {overlay}
          <div style={{ borderBottom: `1px solid lightgray` }}>
            <div style={{ fontSize: `20px`, padding: `14px` }}>
              <a
                href="javascript:void(0)"
                onClick={() => {
                  this.setState({
                    showDrawingForm: !this.state.showDrawingForm,
                  });
                }}
              >
                {__(`Create new profile`)}
                {this.state.showDrawingForm ? (
                  <i className="material-icons">keyboard_arrow_down</i>
                ) : (
                  <i className="material-icons">keyboard_arrow_right</i>
                )}
              </a>
            </div>
            {this.state.showDrawingForm ? (
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <TitleFieldComponent
                      onAdd={this.onNewProfileAdd}
                      type="browserOwned"
                      showIcon={false}
                      inputPlaceholder={this.state.newTitle}
                      disabled={this.state.step !== STEP_ENTER_NAME}
                      saveButtonText={__(`Continue`)}
                      customStyle={{ width: `100%` }}
                    />
                  </div>
                </div>

                {this.state.step !== STEP_ENTER_NAME ? (
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        <p>
                          <strong>{__(`Select datatype`)}:</strong>{" "}
                          {chemicalName}
                          <button
                            type="button"
                            disabled={this.state.step !== STEP_NOT_READY}
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const selectChemicalModalPlaceholderId = `${SELECT_CHEMICAL_DIALOG_PREFIX}-placeholder`;

                              if (
                                $(
                                  `#${selectChemicalModalPlaceholderId}`
                                ).children().length > 0
                              ) {
                                ReactDOM.unmountComponentAtNode(
                                  document.getElementById(
                                    selectChemicalModalPlaceholderId
                                  )
                                );
                              }

                              try {
                                ReactDOM.render(
                                  <div>
                                    <Provider store={reduxStore}>
                                      <ThemeProvider>
                                        <ChemicalSelectorModal
                                          emptyOptionTitle={__(
                                            `Show without data type`
                                          )}
                                          categories={this.props.categories}
                                          useLocalSelectedChemical={true}
                                          localSelectedChemical={
                                            this.state.selectedChemical
                                          }
                                          onClickControl={(selectorValue) => {
                                            this.setState({
                                              localSelectedChemical:
                                                selectorValue,
                                            });
                                            $(
                                              "#" +
                                                SELECT_CHEMICAL_DIALOG_PREFIX
                                            ).modal("hide");
                                          }}
                                        />
                                      </ThemeProvider>
                                    </Provider>
                                  </div>,
                                  document.getElementById(
                                    selectChemicalModalPlaceholderId
                                  )
                                );
                              } catch (e) {
                                console.error(e);
                              }

                              $("#" + SELECT_CHEMICAL_DIALOG_PREFIX).modal({
                                backdrop: `static`,
                              });
                            }}
                          >
                            <i className="fas fa-edit" title={__(`Edit`)}></i>
                          </button>
                          <button
                            type="button"
                            disabled={
                              this.state.localSelectedChemical === false
                            }
                            className="btn btn-xs btn-primary"
                            title={__(`Delete`)}
                            onClick={(event) => {
                              this.setState({ localSelectedChemical: false });
                            }}
                          >
                            <i
                              className="fas fa-eraser"
                              title={__(`Delete`)}
                            ></i>
                          </button>
                        </p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4" style={{ paddingTop: `12px` }}>
                        <p>
                          <strong>{__(`Adjust buffer`)}</strong>
                        </p>
                      </div>
                      <div className="col-md-5" style={{ paddingTop: `14px` }}>
                        <Slider
                          disabled={this.state.step !== STEP_NOT_READY}
                          value={
                            this.state.buffer ? parseInt(this.state.buffer) : 0
                          }
                          min={0}
                          max={500}
                          onChange={(value) => {
                            this.setState({ buffer: value });
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          disabled={this.state.step !== STEP_NOT_READY}
                          type="number"
                          className="form-control"
                          onChange={(event) => {
                            this.setState({ buffer: event.target.value });
                          }}
                          value={this.state.buffer}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4" style={{ paddingTop: `12px` }}>
                        <p>
                          <strong>{__(`Adjust profile bottom`)}</strong>
                        </p>
                      </div>
                      <div className="col-md-8">
                        <input
                          disabled={this.state.step !== STEP_NOT_READY}
                          type="number"
                          className="form-control"
                          onChange={(event) => {
                            this.setState({
                              profileBottom: event.target.value,
                            });
                          }}
                          value={this.state.profileBottom}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6" style={{ textAlign: `center` }}>
                        {this.state.step === STEP_READY_TO_LOAD ||
                        this.state.step === STEP_BEING_DRAWN ? (
                          <a
                            href="javascript:void(0)"
                            className="btn btn-primary"
                            onClick={() => {
                              this.setState(
                                {
                                  step: STEP_NOT_READY,
                                  bufferedProfile: false,
                                },
                                () => {
                                  this.stopDrawing();
                                }
                              );
                            }}
                          >
                            <i className="material-icons">block</i>{" "}
                            {__(`Cancel`)}
                          </a>
                        ) : (
                          <a
                            href="javascript:void(0)"
                            className="btn btn-primary"
                            onClick={() => {
                              this.setState({ step: STEP_BEING_DRAWN }, () => {
                                this.startDrawing();
                              });
                            }}
                          >
                            <i className="material-icons">linear_scale</i>{" "}
                            {__(`Draw profile`)}
                          </a>
                        )}
                      </div>
                      <div className="col-md-6" style={{ textAlign: `center` }}>
                        <a
                          href="javascript:void(0)"
                          className="btn"
                          disabled={this.state.step !== STEP_READY_TO_LOAD}
                          onClick={() => {
                            this.search();
                          }}
                        >
                          {__(`Continue`)}
                        </a>
                      </div>
                    </div>

                    {this.state.step === STEP_CHOOSE_LAYERS ? (
                      <div>
                        <div className="row">
                          <div className="col-md-12">{availableLayers}</div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <button
                              type="button"
                              className="btn btn-raised btn-block btn-primary btn-sm"
                              onClick={() => {
                                this.saveProfile();
                              }}
                            >
                              {__(`Save and exit`)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      false
                    )}
                  </div>
                ) : (
                  false
                )}
              </div>
            ) : (
              false
            )}
          </div>
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <SearchFieldComponent
                  id="measurements-search-control"
                  onSearch={(profilesSearchTerm) => {
                    this.setState({ profilesSearchTerm });
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderBottom: `1px solid lightgray` }}>
            <div style={{ fontSize: `20px`, padding: `14px` }}>
              <a
                href="javascript:void(0)"
                onClick={() => {
                  this.setState({
                    showExistingProfiles: !this.state.showExistingProfiles,
                  });
                }}
              >
                {__(`Select previously created profile`)} (
                {this.getProfilesLength()})
                {this.state.showExistingProfiles ? (
                  <i className="material-icons">keyboard_arrow_down</i>
                ) : (
                  <i className="material-icons">keyboard_arrow_right</i>
                )}
              </a>
            </div>
            {this.state.showExistingProfiles ? (
              <div className="container">
                <div className="row">
                  <div className="col-md-12">{existingProfilesControls}</div>
                </div>
              </div>
            ) : (
              false
            )}
          </div>
        </div>
      );
    } else {
      renderText = (
        <div id="profile-drawing-buffer" style={{ position: `relative` }}>
          <div style={{ textAlign: `center` }}>
            <p>{__(`Please sign in to create / edit Profiles`)}</p>
          </div>
        </div>
      );
    }

    if (projectProfileRows.length > 0) {
      renderText = (
        <div>
          {renderText}
          <div style={{ borderBottom: `1px solid lightgray` }}>
            <div style={{ fontSize: `20px`, padding: `14px` }}>
              <a
                href="javascript:void(0)"
                onClick={() => {
                  this.setState({
                    showProjectProfiles: !this.state.showProjectProfiles,
                  });
                }}
              >
                {__(`Select Profiles from Project`)} (
                {this.getProjectProfilesLength()})
                {this.state.showProjectProfiles ? (
                  <i className="material-icons">keyboard_arrow_down</i>
                ) : (
                  <i className="material-icons">keyboard_arrow_right</i>
                )}
              </a>
            </div>
            {this.state.showProjectProfiles ? (
              <div className="container">
                <div className="row">
                  <div className="col-md-12">{projectProfilesControls}</div>
                </div>
              </div>
            ) : (
              false
            )}
          </div>
        </div>
      );
    }
    return renderText;
  }
}

MenuProfilesComponent.propTypes = {
  cloud: PropTypes.any.isRequired,
  backboneEvents: PropTypes.any.isRequired,
};

const mapStateToProps = (state) => ({
  selectedChemical: state.global.selectedChemical,
  authenticated: state.global.authenticated,
});

const mapDispatchToProps = (dispatch) => ({
  selectChemical: (key) => dispatch(selectChemical(key)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuProfilesComponent);
