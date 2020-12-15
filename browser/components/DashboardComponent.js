import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import reduxStore from './../redux/store';

import ReactTooltip from 'react-tooltip';
import {SELECT_CHEMICAL_DIALOG_PREFIX, TEXT_FIELD_DIALOG_PREFIX, VIEW_MATRIX, VIEW_ROW} from './../constants';
import PlotManager from './../PlotManager';
import ProfileManager from './../ProfileManager';
import TextFieldModal from './TextFieldModal';
import SortablePlotComponent from './SortablePlotComponent';
import SortableProfileComponent from './SortableProfileComponent';
import SortablePlotsGridComponent from './SortablePlotsGridComponent';
import {isNumber} from 'util';
import arrayMove from 'array-move';
import trustedIpAddresses from '../trustedIpAddresses';

let syncInProg = false;

const uuidv1 = require('uuid/v1');

const DASHBOARD_ITEM_PLOT = 0;
const DASHBOARD_ITEM_PROJECT_PLOT = 3;
const DASHBOARD_ITEM_PROFILE = 1;
const DASHBOARD_ITEM_PROJECT_PROFILE = 2;

const DISPLAY_MIN = 0;
const DISPLAY_HALF = 1;
const DISPLAY_MAX = 2;
let currentDisplay = DISPLAY_HALF, previousDisplay = DISPLAY_MAX;

let modalHeaderHeight = 70;

let _self = false, resizeTimeout = false;

/**
 * Component creates plots management form and is the source of truth for plots overall
 */
class DashboardComponent extends React.Component {
    constructor(props) {
        super(props);
        let queryParams = new URLSearchParams(window.location.search);
        let licenseToken = queryParams.get('license');
        let license = null;
        if (licenseToken) {
            license = JSON.parse(base64.decode(licenseToken.split('.')[1]));
            if (typeof license === 'object') {
                license = license.license;
            }
        }
        if (trustedIpAddresses.includes(window._vidiIp)) {
            license = "premium";
        }

        let dashboardItems = [];
        if (this.props.initialPlots) {
            this.props.initialPlots.map(item => {
                dashboardItems.push({
                    type: DASHBOARD_ITEM_PLOT,
                    item
                });
            });
        }

        this.state = {
            view: VIEW_MATRIX,
            newPlotName: ``,
            dashboardItems,
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
            modalScroll: {}
        };

        this.plotManager = new PlotManager();
        this.profileManager = new ProfileManager();

        this.handleShowPlot = this.handleShowPlot.bind(this);
        this.handleHidePlot = this.handleHidePlot.bind(this);
        this.handleCreatePlot = this.handleCreatePlot.bind(this);
        this.handleRemovePlot = this.handleRemovePlot.bind(this);
        this.handleDeletePlot = this.handleDeletePlot.bind(this);
        this.handleHighlightPlot = this.handleHighlightPlot.bind(this);
        this.handleArchivePlot = this.handleArchivePlot.bind(this);

        this.handleShowProfile = this.handleShowProfile.bind(this);
        this.handleHideProfile = this.handleHideProfile.bind(this);
        this.handleCreateProfile = this.handleCreateProfile.bind(this);
        this.handleRemoveProfile = this.handleRemoveProfile.bind(this);
        this.handleDeleteProfile = this.handleDeleteProfile.bind(this);
        this.handleProfileClick = this.handleProfileClick.bind(this);
        this.handleChangeDatatypeProfile = this.handleChangeDatatypeProfile.bind(this);
        this.setProjectProfiles = this.setProjectProfiles.bind(this);
        this.getProfilesLength = this.getProfilesLength.bind(this);
        this.getPlotsLength = this.getPlotsLength.bind(this);

        this.getFeatureByGidFromDataSource = this.getFeatureByGidFromDataSource.bind(this);
        this.handleNewPlotNameChange = this.handleNewPlotNameChange.bind(this);
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
                _self.setState({lastUpdate: new Date()});
            }, 500);
        });

        this.props.backboneEvents.get().on(`session:authChange`, (authenticated) => {
            if (authenticated) {
                _self.refreshProfilesList();
                _self.hydratePlotsFromIds();
            } else {
                let newDashboardItems = [];
                _self.state.dashboardItems.map(item => {
                    if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                        newDashboardItems.push(JSON.parse(JSON.stringify(item)));
                    }
                });

                _self.setState({
                    profiles: [],
                    activeProfiles: [],
                    dashboardItems: newDashboardItems
                });
            }
        });

        this.refreshProfilesList();
    }

    componentDidMount() {
        this.nextDisplayType();
    }

    getLicense() {
        return this.state.license;
    }

    getModalScroll() {
        return this.state.modalScroll;
    }

    setModalScroll(modalScroll) {
        this.setState({modalScroll});
    }

    refreshProfilesList() {
        this.profileManager.getAll().then(profiles => {
            let newDashboardItems = [];
            this.state.dashboardItems.map(item => {
                if (item.type !== DASHBOARD_ITEM_PROFILE) {
                    newDashboardItems.push(JSON.parse(JSON.stringify(item)));
                }
            });

            profiles.map(item => {
                newDashboardItems.push({
                    type: DASHBOARD_ITEM_PROFILE,
                    item
                });
            });

            this.setState({
                profiles,
                dashboardItems: newDashboardItems
            });
            this.props.onProfilesChange(this.getProfiles());

        });
    }

    dehydratePlots(plots) {
        return this.plotManager.dehydratePlots(plots);
    }

    hydratePlotsFromIds(plots) {
        return this.plotManager.hydratePlotsFromIds(plots);
    }

    getProfiles() {
        let allProfiles = [];
        this.state.projectProfiles.map(item => {
            item.fromProject = true;
            allProfiles.push(item);
        });
        this.state.profiles.map(item => {
            allProfiles.push(item);
        })
        allProfiles = allProfiles.sort((a, b) => b['created_at'] - a['created_at']);
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
        this.profileManager.create(data).then(newProfile => {
            let profilesCopy = JSON.parse(JSON.stringify(this.state.profiles));
            profilesCopy.unshift(newProfile);

            if (activateOnCreate) {
                let activeProfilesCopy = JSON.parse(JSON.stringify(this.state.activeProfiles));
                if (activeProfilesCopy.indexOf(newProfile.key) === -1) activeProfilesCopy.push(newProfile.key);

                let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
                dashboardItemsCopy.push({
                    type: DASHBOARD_ITEM_PROFILE,
                    item: newProfile
                });

                this.setState({
                    profiles: profilesCopy,
                    dashboardItems: dashboardItemsCopy,
                    activeProfiles: activeProfilesCopy
                });

                this.props.onActiveProfilesChange(activeProfilesCopy);
            } else {
                this.setState({profiles: profilesCopy});
            }

            if (callback) callback();

            this.props.onProfilesChange(this.getProfiles());
        }).catch(error => {
            console.error(`Error occured while creating profile (${error})`);
            alert(`Error occured while creating profile (${error})`);
            if (callback) callback();
        });
    }

    handleChangeDatatypeProfile(profileKey) {
        let selectedProfile = false;
        this.getProfiles().map(item => {
            if (item.key === profileKey) {
                selectedProfile = item;
            }
        });

        if (selectedProfile === false) throw new Error(`Unable to find the profile with key ${profileKey}`);

        this.setState({createdProfileChemical: false}, () => {
            const abortDataTypeChange = () => {
                this.setState({createdProfileChemical: false});
                $('#' + SELECT_CHEMICAL_DIALOG_PREFIX).modal('hide');
            };

            const uniqueKey = uuidv1();

            try {
                ReactDOM.render(<div key={`tmp_key_chemical_${uniqueKey}`}>
                    <Provider store={reduxStore}>
                        <ChemicalSelectorModal
                            useLocalSelectedChemical={true}
                            localSelectedChemical={this.state.selectedChemical}
                            onClickControl={(selectorValue) => {
                                this.setState({createdProfileChemical: selectorValue}, () => {
                                    try {
                                        ReactDOM.render(<div key={`tmp_key_text_${uniqueKey}`}>
                                            <TextFieldModal
                                                title={__(`Enter the name of created profile`)}
                                                onClickControl={(title) => {
                                                    $.snackbar({
                                                        id: "snackbar-watsonc",
                                                        content: "<span id='conflict-progress'>" + __("The profile with the new datatype is being created") + "</span>",
                                                        htmlAllowed: true,
                                                        timeout: 1000000
                                                    });

                                                    this.handleCreateProfile({
                                                        title,
                                                        profile: selectedProfile.value.profile,
                                                        buffer: selectedProfile.value.buffer,
                                                        depth: selectedProfile.value.depth,
                                                        compound: this.state.createdProfileChemical,
                                                        boreholeNames: selectedProfile.value.boreholeNames,
                                                        layers: selectedProfile.value.layers,
                                                    }, true, () => {
                                                        this.setState({createdProfileChemical: false}, () => {
                                                            jquery("#snackbar-watsonc").snackbar("hide");
                                                        });
                                                    });
                                                }}
                                                onCancelControl={abortDataTypeChange}/>
                                        </div>, document.getElementById(`${TEXT_FIELD_DIALOG_PREFIX}-placeholder`));
                                    } catch (e) {
                                        console.error(e);
                                    }

                                    $('#' + TEXT_FIELD_DIALOG_PREFIX).modal({backdrop: `static`});
                                });

                                $('#' + SELECT_CHEMICAL_DIALOG_PREFIX).modal('hide');
                            }}
                            onCancelControl={abortDataTypeChange}/>
                    </Provider>
                </div>, document.getElementById(`${SELECT_CHEMICAL_DIALOG_PREFIX}-placeholder`));
            } catch (e) {
                console.error(e);
            }

            $('#' + SELECT_CHEMICAL_DIALOG_PREFIX).modal({backdrop: `static`});
        });
    }

    handleProfileClick(e) {
        if (e && e.points && e.points.length === 1 && e.points[0].data && e.points[0].data.text) {
            if (e.points[0].data.text.indexOf(`DGU`) > -1) {
                let boreholeNumber = false;
                let lines = e.points[0].data.text.split(`<br>`);
                lines.map(item => {
                    if (item.indexOf(`DGU`) > -1) {
                        boreholeNumber = item.replace(`DGU`, ``)
                            .replace(/>/g, ``)
                            .replace(/</g, ``)
                            .replace(/b/g, ``)
                            .replace(/\//g, ``).trim();
                    }
                });
                if (boreholeNumber !== false) {
                    this.props.onOpenBorehole(boreholeNumber);
                }
            }
        }
    }

    handleDeleteProfile(profileKey, callback = false) {
        this.profileManager.delete(profileKey).then(() => {
            let profilesCopy = JSON.parse(JSON.stringify(this.state.profiles));

            let profileWasDeleted = false;
            profilesCopy.map((profile, index) => {
                if (profile.key === profileKey) {
                    profilesCopy.splice(index, 1);
                    profileWasDeleted = true;
                    return false;
                }
            });

            if (profileWasDeleted === false) {
                console.warn(`Profile ${profileKey} was deleted only from backend storage`);
            }

            let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
            dashboardItemsCopy.map((item, index) => {
                if (item.type === DASHBOARD_ITEM_PROFILE) {
                    if (item.key === profileKey) {
                        dashboardItemsCopy.splice(index, 1);
                        return false;
                    }
                }
            });

            let activeProfilesCopy = JSON.parse(JSON.stringify(this.state.activeProfiles));
            activeProfilesCopy.map((profile, index) => {
                if (profile === profileKey) {
                    activeProfilesCopy.splice(index, 1);
                    return false;
                }
            });

            if (callback) callback();

            this.setState({
                profiles: profilesCopy,
                activeProfiles: activeProfilesCopy,
                dashboardItems: dashboardItemsCopy
            });
            this.props.onProfilesChange(this.getProfiles());

        }).catch(error => {
            console.error(`Error occured while deleting profile (${error})`)
        });
    }

    handleShowProfile(profileId) {
        if (!profileId) throw new Error(`Empty profile identifier`);

        let activeProfiles = JSON.parse(JSON.stringify(this.state.activeProfiles));
        if (activeProfiles.indexOf(profileId) === -1) activeProfiles.push(profileId);
        this.setState({activeProfiles}, () => {
            this.props.onActiveProfilesChange(this.state.activeProfiles);
        });
    }

    handleHideProfile(profileId) {
        if (!profileId) throw new Error(`Empty profile identifier`);

        let activeProfiles = JSON.parse(JSON.stringify(this.state.activeProfiles));
        if (activeProfiles.indexOf(profileId) > -1) activeProfiles.splice(activeProfiles.indexOf(profileId), 1);
        this.setState({activeProfiles}, () => {
            this.props.onActiveProfilesChange(this.state.activeProfiles);
        });
    }

    getPlots(getArchived = true) {
        let allPlots = [];
        this.state.projectPlots.map((item) => {
            item.fromProject = true;
            allPlots.push(item);
        });
        this.state.plots.map((item) => {
            item.fromProject = false;
            allPlots.push(item);
        })
        allPlots = allPlots.filter((item) => {
            if (getArchived) {
                return item;
            } else if (!item.isArchived) {
                return item;
            }
        })
        allPlots = allPlots.sort((a, b) => b['created_at'] - a['created_at']);
        const unique = (myArr) => {
            return myArr.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj["id"]).indexOf(obj["id"]) === pos;
            });
        }
        allPlots = unique(allPlots);
        return allPlots;
    }

    getActivePlots() {
        let activePlots = this.state.plots.filter((item) => {
            if (this.state.activePlots.indexOf(item.id) !== -1) {
                return item.id;
            }
        });
        this.state.projectPlots.map((item) => {
            activePlots.push(item.id);
        });
        return JSON.parse(JSON.stringify(activePlots));
    }


    addPlot(newPlotName, activateOnCreate = false) {
        this.handleCreatePlot(newPlotName, activateOnCreate);
    }

    setProjectPlots(projectPlots) {
        let dashboardItemsCopy = [];
        let plotsNotOnDashboard = [];
        let profilesNotOnDashboard = [];
        const unique = (data, key) => {
            return [...new Map(data.map(item => [key(item), item])).values()]
        };

        // console.log("this.state.dashboardItems", this.state.dashboardItems);
        this.state.dashboardItems.map(item => {
            if (item.type !== DASHBOARD_ITEM_PROJECT_PLOT) {
                dashboardItemsCopy.push(item);
            }
        });

        projectPlots.map(item => {
            dashboardItemsCopy.push({
                type: DASHBOARD_ITEM_PROJECT_PLOT,
                item
            });
        });

        dashboardItemsCopy.map(item => {
            if (typeof item.type !== "undefined" && item.type === 0) {
                plotsNotOnDashboard.push(item.item.id);
            } else if (typeof item.type !== "undefined" && item.type === 3) {
                // Remove an id again if it appears more than once in this.state.dashboardItems
                plotsNotOnDashboard = plotsNotOnDashboard.filter(e => e !== item.item.id);
            }
            if (typeof item.type !== "undefined" && item.type === 1) {
                profilesNotOnDashboard.push(item.item.key);
            } else if (typeof item.type !== "undefined" && item.type === 2) {
                // Remove a key again if it appears more than once in this.state.dashboardItems
                profilesNotOnDashboard = profilesNotOnDashboard.filter(e => e !== item.item.key);
            }
        });

        // Remove duplets
        dashboardItemsCopy = unique(dashboardItemsCopy, item => item.item.id);
        // console.log("projectPlots", projectPlots)
        // console.log("dashboardItemsCopy", dashboardItemsCopy)
        // console.log("plotsNotOnDashboard", plotsNotOnDashboard)
        // console.log("profilesNotOnDashboard", plotsNotOnDashboard)
        this.setState({projectPlots, dashboardItems: dashboardItemsCopy}, () => {
            setTimeout(() => {
                plotsNotOnDashboard.forEach(id => this.handleHidePlot(id));
                profilesNotOnDashboard.forEach(id => this.handleHideProfile(id));
            }, 1000)
        });
    }

    setPlots(plots) {
        let dashboardItemsCopy = [];
        this.state.dashboardItems.map(item => {
            if (item.type !== DASHBOARD_ITEM_PLOT /* type 0 */ && item.type !== DASHBOARD_ITEM_PROJECT_PLOT /* type 3*/) {
                dashboardItemsCopy.push(item);
            }
        });

        plots.map(item => {
            dashboardItemsCopy.push({
                type: DASHBOARD_ITEM_PLOT,
                item
            });
        });

        this.setState({plots, dashboardItems: dashboardItemsCopy});
    }

    setProjectProfiles(projectProfiles) {
        const unique = (myArr) => {
            return myArr.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj["key"]).indexOf(obj["key"]) === pos;
            });
        }
        // Remove duplets
        projectProfiles = unique(projectProfiles);
        // console.log("Setting Profiles");
        // console.log(projectProfiles);
        let dashboardItemsCopy = [];
        this.state.dashboardItems.map(item => {
            if (item.type !== DASHBOARD_ITEM_PROJECT_PROFILE) {
                dashboardItemsCopy.push(item);
            }
        });
        projectProfiles.map(item => {
            dashboardItemsCopy.push({
                type: DASHBOARD_ITEM_PROJECT_PROFILE,
                item
            });
            this.handleShowProfile(item.key);
        })
        this.setState({projectProfiles, dashboardItems: dashboardItemsCopy});
    }

    getProfilesLength() {
        let activeProfiles = [];
        this.state.profiles.map((item) => {
            if (activeProfiles.indexOf(item.key) === -1) {
                activeProfiles.push(item.key);
            }
        });
        this.state.activeProfiles.map((item) => {
            if (activeProfiles.indexOf(item.key) === -1) {
                activeProfiles.push(item.key);
            }
        });
        return activeProfiles.length;
    }

    getPlotsLength() {
        return this.state.plots.length + this.state.projectPlots.length;
    }

    syncPlotData() {
        let activePlots = this.state.activePlots;
        let plots = this.state.dashboardItems.filter(e => {
            if (activePlots.includes(e.item.id)) {
                return true;
            }
        });
        plots = plots.map(e => e.item);
        let newPlots = plots;
        let preCount = 0;
        let count = 0;
        plots.forEach((e, i) => {
            if ('id' in e) {
                let obj = e.measurementsCachedData;
                if (Object.keys(obj).length === 0 && obj.constructor === Object) {
                    preCount++;
                } else {
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            preCount++;
                        }
                    }
                }
            }
        });
        plots.forEach((e, i) => {
            if ('id' in e) {
                let obj = e.measurementsCachedData;
                let shadowI = i;
                newPlots[shadowI] = e;
                if (Object.keys(obj).length === 0 && obj.constructor === Object) {
                    count++;
                } else {
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            let rel;
                            rel = key.split(":")[1].startsWith("_") ? "chemicals.boreholes_time_series_with_chemicals" : "sensor.sensordata_with_correction";
                            // Lazy load data and sync
                            $.ajax({
                                url: "/api/sql/jupiter?srs=25832&q=SELECT * FROM " + rel + " WHERE boreholeno='" + key.split(":")[0] + "'",
                                scriptCharset: "utf-8",
                                success: (response) => {
                                    newPlots[shadowI].measurementsCachedData[key].data = response.features[0];
                                    count++;
                                    //console.log("preCount", preCount)
                                    //console.log("plots.length", plots.length)
                                    //console.log("newPlots", newPlots)
                                    if (count === preCount) {
                                        console.log("All plots synced");
                                        _self.setPlots(newPlots);
                                    }
                                }
                            })
                        }
                    }
                }
            }
        });
    }

    handleCreatePlot(title, activateOnCreate = false) {
        this.plotManager.create(title).then(newPlot => {
            let plotsCopy = JSON.parse(JSON.stringify(this.state.plots));
            plotsCopy.unshift(newPlot);

            let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
            dashboardItemsCopy.push({
                type: DASHBOARD_ITEM_PLOT,
                item: newPlot
            });

            if (activateOnCreate) {
                let activePlotsCopy = JSON.parse(JSON.stringify(this.state.activePlots));
                if (activePlotsCopy.indexOf(newPlot.id) === -1) activePlotsCopy.push(newPlot.id);

                this.setState({
                    plots: plotsCopy,
                    dashboardItems: dashboardItemsCopy,
                    activePlots: activePlotsCopy
                });

                this.props.onActivePlotsChange(activePlotsCopy, this.getPlots());
            } else {
                this.setState({
                    plots: plotsCopy,
                    dashboardItems: dashboardItemsCopy
                });
            }

            this.props.onPlotsChange(this.getPlots());
        }).catch(error => {
            console.error(`Error occured while creating plot (${error})`)
        });
    }

    handleRemoveProfile(profileKey) {
        if (!profileKey) throw new Error(`Empty profile key`);

        let activeProfilesCopy = JSON.parse(JSON.stringify(this.state.activeProfiles));
        if (activeProfilesCopy.indexOf(profileKey) > -1) activeProfilesCopy.splice(activeProfilesCopy.indexOf(profileKey), 1);

        this.setState({activeProfiles: activeProfilesCopy});
        this.props.onActiveProfilesChange(activeProfilesCopy);
    }

    handleRemovePlot(id) {
        if (!id) throw new Error(`Empty plot identifier`);

        let activePlotsCopy = JSON.parse(JSON.stringify(this.state.activePlots));
        if (activePlotsCopy.indexOf(id) > -1) activePlotsCopy.splice(activePlotsCopy.indexOf(id), 1);

        this.setState({activePlots: activePlotsCopy});
        this.props.onActivePlotsChange(activePlotsCopy, this.getPlots());
    }

    handleDeletePlot(id, name) {
        if (!id) throw new Error(`Empty plot identifier`);

        if (confirm(__(`Delete plot`) + ` ${name ? name : id}?`)) {
            this.plotManager.delete(id).then(() => {
                let plotsCopy = JSON.parse(JSON.stringify(this.state.plots));
                let plotWasDeleted = false;
                plotsCopy.map((plot, index) => {
                    if (plot.id === id) {
                        plotsCopy.splice(index, 1);
                        plotWasDeleted = true;
                        return false;
                    }
                });

                let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
                dashboardItemsCopy.map((item, index) => {
                    if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                        if (item.item.id === id) {
                            dashboardItemsCopy.splice(index, 1);
                            return false;
                        }
                    }
                });

                if (plotWasDeleted === false) {
                    console.warn(`Plot ${id} was deleted only from backend storage`);
                }

                this.setState({
                    plots: plotsCopy,
                    dashboardItems: dashboardItemsCopy
                });

                this.props.onPlotsChange(this.getPlots());
            }).catch(error => {
                console.error(`Error occured while creating plot (${error})`)
            });
        }
    }

    handleHighlightPlot(plotId) {
        if (!plotId) throw new Error(`Empty plot identifier`);

        this.setState({highlightedPlot: (plotId === this.state.highlightedPlot ? false : plotId)}, () => {
            this.props.onHighlightedPlotChange(this.state.highlightedPlot, this.state.plots);
        });
    }

    handleShowPlot(plotId) {
        if (!plotId) throw new Error(`Empty plot identifier`);

        let activePlots = JSON.parse(JSON.stringify(this.state.activePlots));

        if (activePlots.indexOf(plotId) === -1) activePlots.push(plotId);
        let plots = this.getPlots()
        this.setState({activePlots}, () => {
            this.props.onActivePlotsChange(this.state.activePlots, plots);
        });
    }

    handleHidePlot(plotId) {
        if (!plotId) throw new Error(`Empty plot identifier`);

        let activePlots = JSON.parse(JSON.stringify(this.state.activePlots));
        if (activePlots.indexOf(plotId) > -1) activePlots.splice(activePlots.indexOf(plotId), 1);
        this.setState({activePlots}, () => {
            this.props.onActivePlotsChange(this.state.activePlots, this.getPlots());
        });
    }

    handleNewPlotNameChange(event) {
        this.setState({newPlotName: event.target.value});
    }

    handleArchivePlot(plotId, isArchived) {
        let plots = JSON.parse(JSON.stringify(this.state.plots));
        let correspondingPlot = false;
        let correspondingPlotIndex = false;
        plots.map((plot, index) => {
            if (plot.id == plotId) {
                correspondingPlot = plot;
                correspondingPlotIndex = index;
            }

        });
        if (correspondingPlot === false) throw new Error(`Plot with id ${plotId} does not exist`);
        correspondingPlot.isArchived = isArchived;
        plots[correspondingPlotIndex] = correspondingPlot;

        let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
        dashboardItemsCopy.map((item, index) => {
            if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                if (item.item.id === correspondingPlot.id) {
                    dashboardItemsCopy[index].item = correspondingPlot;
                    return false;
                }
            }
        });
        this.plotManager.update(correspondingPlot).then(() => {
            this.setState({
                plots,
                dashboardItems: dashboardItemsCopy
            });

            this.props.onPlotsChange(this.getPlots());
        }).catch(error => {
            console.error(`Error occured while updating plot (${error})`)
        });
    }

    _modifyAxes(plotId, gid, measurementKey, measurementIntakeIndex, action) {
        if (!plotId) throw new Error(`Invalid plot identifier`);
        if ((!gid && gid !== 0) || !measurementKey || (!measurementIntakeIndex && measurementIntakeIndex !== 0)) throw new Error(`Invalid measurement location parameters`);

        let plots = JSON.parse(JSON.stringify(this.state.plots));
        let correspondingPlot = false;
        let correspondingPlotIndex = false;
        plots.map((plot, index) => {
            if (plot.id === plotId) {
                correspondingPlot = plot;
                correspondingPlotIndex = index;
            }
        });

        if (correspondingPlot === false) throw new Error(`Plot with id ${plotId} does not exist`);
        let measurementIndex = gid + ':' + measurementKey + ':' + measurementIntakeIndex;
        if (action === `add`) {
            if (correspondingPlot.measurements.indexOf(measurementIndex) === -1) {
                let measurementData = this.getFeatureByGidFromDataSource(gid);
                if (measurementData) {
                    var currentTime = new Date();
                    correspondingPlot.measurements.push(measurementIndex);
                    correspondingPlot.measurementsCachedData[measurementIndex] = {
                        data: measurementData,
                        created_at: currentTime.toISOString()
                    }
                } else {
                    throw new Error(`Unable to find data for measurement index ${measurementIndex}`);
                }
            }
        } else if (action === `delete`) {
            //console.log("correspondingPlot", correspondingPlot)
            //console.log("measurementIndex", measurementIndex)
            if (correspondingPlot.measurements.indexOf(measurementIndex) === -1) {
                throw new Error(`Unable to find measurement ${measurementIndex} for ${plotId} plot`);
            } else {
                if (measurementIndex in correspondingPlot.measurementsCachedData) {
                    correspondingPlot.measurements.splice(correspondingPlot.measurements.indexOf(measurementIndex), 1);
                    delete correspondingPlot.measurementsCachedData[measurementIndex];
                } else {
                    throw new Error(`Data integrity violation: plot ${plotId} does not contain cached data for measurement ${measurementIndex}`);
                }
            }
        } else {
            throw new Error(`Unrecognized action ${action}`);
        }

        plots[correspondingPlotIndex] = correspondingPlot;

        let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
        dashboardItemsCopy.map((item, index) => {
            if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                if (item.item.id === correspondingPlot.id) {
                    dashboardItemsCopy[index].item = correspondingPlot;
                    return false;
                }
            }
        });
        //console.log("dashboardItemsCopy", dashboardItemsCopy)
        //console.log("plots", plots)
        this.plotManager.update(correspondingPlot).then(() => {
            this.setState({
                plots,
                projectPlots: plots,
                dashboardItems: dashboardItemsCopy
            });
            this.props.onPlotsChange(this.getPlots());
        }).catch(error => {
            console.error(`Error occured while updating plot (${error})`)
        });
    }

    setDataSource(dataSource) {
        let plots = JSON.parse(JSON.stringify(this.state.plots));
        let updatePlotsPromises = [];
        plots.map((plot, index) => {
            let plotWasUpdatedAtLeastOnce = false;
            plot.measurements.map(measurementIndex => {
                let splitMeasurementIndex = measurementIndex.split(`:`);
                if (splitMeasurementIndex.length !== 3 && splitMeasurementIndex.length !== 4) throw new Error(`Invalid measurement index`);
                let measurementData = false;
                dataSource.map(item => {
                    if (item.properties.boreholeno === parseInt(splitMeasurementIndex[0])) {
                        measurementData = item;
                        return false;
                    }
                });

                if (measurementData) {
                    var currentTime = new Date();
                    plots[index].measurementsCachedData[measurementIndex] = {
                        data: measurementData,
                        created_at: currentTime.toISOString()
                    };

                    plotWasUpdatedAtLeastOnce = true;
                }
            });

            if (plotWasUpdatedAtLeastOnce) {
                updatePlotsPromises.push(this.plotManager.update(plots[index]));
            }
        });

        Promise.all(updatePlotsPromises).then(() => {
            let dashboardItemsCopy = JSON.parse(JSON.stringify(this.state.dashboardItems));
            dashboardItemsCopy.map((item, index) => {
                if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                    plots.map(updatedPlot => {
                        if (item.item.id === updatedPlot.id) {
                            dashboardItemsCopy[index].item = updatedPlot;
                            return false;
                        }
                    });
                }
            });

            this.setState({dataSource, plots, dashboardItems: dashboardItemsCopy});
        }).catch(errors => {
            console.error(`Unable to update measurement data upon updating the data source`, errors);
        });
    }

    getFeatureByGidFromDataSource(boreholeno, check = true) {
        if (check === false) {
            throw new Error(`Invalid boreholeno ${boreholeno} was provided`);
        }

        let featureWasFound = false;
        this.state.dataSource.map(item => {
            if (item.properties.boreholeno === boreholeno) {
                featureWasFound = item;
                return false;
            }
        });

        return featureWasFound;
    }

    addMeasurement(plotId, gid, measurementKey, measurementIntakeIndex) {
        this._modifyAxes(plotId, gid, measurementKey, measurementIntakeIndex, `add`);
    }

    deleteMeasurement(plotId, gid, measurementKey, measurementIntakeIndex) {
        this._modifyAxes(plotId, gid, measurementKey, measurementIntakeIndex, `delete`);
    }

    handlePlotSort({oldIndex, newIndex}) {
        this.setState(({dashboardItems}) => ({
            dashboardItems: arrayMove(dashboardItems, oldIndex, newIndex)
        }));
    };

    onSetMin() {
        $(PLOTS_ID).animate({
            top: ($(document).height() - modalHeaderHeight) + 'px'
        }, 500, function () {
            $(PLOTS_ID).find('.modal-body').css(`max-height`, modalHeaderHeight + 'px');
        });

        $('.js-expand-less').hide();
        $('.js-expand-half').show();
        $('.js-expand-more').show();
        $(PLOTS_ID + ' .modal-body').css(`visibility`, `hidden`);
    }

    onSetHalf() {
        $(PLOTS_ID).animate({
            top: "50%"
        }, 500, function () {
            $(PLOTS_ID).find('.modal-body').css(`max-height`, ($(document).height() * 0.5 - modalHeaderHeight - 20) + 'px');
        });

        $('.js-expand-less').show();
        $('.js-expand-half').hide();
        $('.js-expand-more').show();
        $(PLOTS_ID + ' .modal-body').css(`visibility`, `visible`);
    }

    onSetMax() {
        $(PLOTS_ID).animate({
            top: "10%"
        }, 500, function () {
            $(PLOTS_ID).find('.modal-body').css(`max-height`, ($(document).height() * 0.9 - modalHeaderHeight - 10) + 'px');
        });

        $('.js-expand-less').show();
        $('.js-expand-half').show();
        $('.js-expand-more').hide();
        $(PLOTS_ID + ' .modal-body').css(`visibility`, `visible`);
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
        setTimeout(() => {
            if (!syncInProg) {
                //console.log("Syncing plots")
                //this.syncPlotData();
            }
            // Debounce sync
            syncInProg = true;
            setTimeout(() => syncInProg = false, 2000);
        }, 500);

        let plotsControls = (<p style={{
            textAlign: `center`,
            paddingTop: `20px`
        }}>{__(`No timeseries were created or set as active yet`)}</p>);

        // Actualize elements location
        if (currentDisplay === DISPLAY_MIN) {
            this.onSetMin();
        } else if (currentDisplay === DISPLAY_HALF) {
            this.onSetHalf();
        } else if (currentDisplay === DISPLAY_MAX) {
            this.onSetMax();
        }

        let listItemHeightPx = Math.round(($(document).height() * 0.9 - modalHeaderHeight - 10) / 2);

        let localPlotsControls = [];
        let plottedProfiles = [];
        this.state.dashboardItems.map((item, index) => {
            if (item.type === DASHBOARD_ITEM_PLOT || item.type === DASHBOARD_ITEM_PROJECT_PLOT) {
                let plot = item.item;
                let plotId = plot.id || plot.key;
                if (this.state.activePlots.indexOf(plotId) > -1) {
                    localPlotsControls.push(<SortablePlotComponent
                        key={`sortable_${index}`}
                        viewMode={this.state.view}
                        height={listItemHeightPx}
                        index={index}
                        handleDelete={this.handleRemovePlot}
                        meta={plot}/>);
                }
            } else if (item.type === DASHBOARD_ITEM_PROFILE || item.type === DASHBOARD_ITEM_PROJECT_PROFILE) {
                if (plottedProfiles.indexOf(item.item.key) > -1) {
                    return;
                }
                let profile = item.item;
                if (this.state.activeProfiles.indexOf(profile.key) > -1) {
                    localPlotsControls.push(<SortableProfileComponent
                        key={`sortable_${index}`}
                        viewMode={this.state.view}
                        height={listItemHeightPx}
                        index={index}
                        handleChangeDatatype={this.handleChangeDatatypeProfile}
                        handleDelete={this.handleRemoveProfile}
                        handleClick={this.handleProfileClick}
                        meta={profile}/>);
                    plottedProfiles.push(profile.key);
                }
            } else {
                throw new Error(`Unrecognized dashboard item type ${item.type}`);
            }
        });

        if (localPlotsControls.length > 0) {
            plotsControls = (
                <SortablePlotsGridComponent axis="xy" onSortEnd={this.handlePlotSort}
                                            useDragHandle>{localPlotsControls}</SortablePlotsGridComponent>);
        }

        const setNoExpanded = () => {
            currentDisplay = DISPLAY_HALF;
            previousDisplay = DISPLAY_MAX;
            this.nextDisplayType();
        };

        const setHalfExpanded = () => {
            currentDisplay = DISPLAY_MIN;
            previousDisplay = DISPLAY_HALF;
            this.nextDisplayType();
        };

        const setFullExpanded = () => {
            currentDisplay = DISPLAY_HALF;
            previousDisplay = DISPLAY_MIN;
            this.nextDisplayType();
        };

        return (<div>
            <div className="modal-header" id="watsonc-plots-dialog-controls">
                <ReactTooltip/>
                <div className="modal-header-content">
                    <div style={{height: `40px`, display: `flex`}}>
                        <div style={{paddingRight: `20px`}}>
                            <div>
                                <button
                                    type="button"
                                    className="close js-expand-more expand-more"
                                    aria-hidden="true"
                                    onClick={setFullExpanded}
                                    style={{opacity: `1`}}
                                    title={__(`Expand dashboard`)}>
                                    <i className="material-icons" style={{fontWeight: `900`}}>expand_less</i>
                                </button>
                                <button
                                    type="button"
                                    className="close js-expand-half expand-half"
                                    aria-hidden="true"
                                    onClick={setHalfExpanded}
                                    style={{opacity: `1`}}
                                    title={__(`Open dashboard halfway`)}>
                                    <i className="material-icons" style={{fontWeight: `900`}}>swap_vert</i>
                                </button>
                                <button
                                    type="button"
                                    className="close js-expand-less expand-less"
                                    aria-hidden="true"
                                    onClick={setNoExpanded}
                                    style={{opacity: `1`}}
                                    title={__(`Minimize dashboard`)}>
                                    <i className="material-icons" style={{fontWeight: `900`}}>expand_more</i>
                                </button>
                            </div>
                        </div>
                        <div
                            style={{cursor: `pointer`}}
                            data-delay-show="500"
                            data-tip={__(`Click on the modal header to expand or minify the Dashboard`)}
                            onClick={this.nextDisplayType.bind(this)}>
                            {__(`Calypso dashboard`)}
                        </div>
                        <div
                            style={{paddingLeft: `10px`, cursor: `pointer`}}
                            data-delay-show="500"
                            data-tip={__(`Click on the modal header to expand or minify the Dashboard`)}
                            onClick={this.nextDisplayType.bind(this)}>
                            <p className="text-muted" style={{margin: `0px`}}>
                                ({__(`Timeseries total`).toLowerCase()}: {this.getPlotsLength()}, {__(`timeseries active`)}: {this.state.activePlots.length}; {__(`Profiles total`).toLowerCase()}: {this.getProfilesLength()}, {__(`profiles active`)}: {this.state.activeProfiles.length})
                            </p>
                        </div>
                        <div style={{
                            flexGrow: `1`,
                            textAlign: `right`
                        }}>
                            <div className="btn-group" role="group" style={{margin: `0px`}}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        _self.syncPlotData();
                                    }}
                                    className="btn btn-sm btn-primary btn-default">{__(`Sync med database`)}</button>
                            </div>
                            <div className="btn-group btn-group-raised" role="group" style={{margin: `0px`}}>
                                <button
                                    type="button"
                                    disabled={this.state.view === VIEW_MATRIX}
                                    onClick={() => {
                                        this.setState({view: VIEW_MATRIX});
                                    }}
                                    style={this.state.view === VIEW_MATRIX ? {color: `black`} : {}}
                                    className="btn btn-sm btn-primary btn-default">{__(`Matrix view`)}</button>
                                <button
                                    type="button"
                                    disabled={this.state.view === VIEW_ROW}
                                    onClick={() => {
                                        this.setState({view: VIEW_ROW});
                                    }}
                                    style={this.state.view === VIEW_ROW ? {color: `black`} : {}}
                                    className="btn btn-sm btn-primary btn-default">{__(`Row view`)}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-body" style={{padding: `0px 20px 0px 0px`, margin: `0px`}}>
                <div className="form-group" style={{marginBottom: `0px`, paddingBottom: `0px`}}>{plotsControls}</div>
            </div>
        </div>);
    }
}

DashboardComponent.propTypes = {
    initialPlots: PropTypes.array.isRequired,
    onOpenBorehole: PropTypes.func.isRequired,
    onPlotsChange: PropTypes.func.isRequired,
    onActivePlotsChange: PropTypes.func.isRequired,
    onHighlightedPlotChange: PropTypes.func.isRequired,
};

export default DashboardComponent;
