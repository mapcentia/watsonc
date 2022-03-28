import {useState, useEffect, useContext, useCallback} from "react";
import {connect} from "react-redux";
import styled from "styled-components";
import {hexToRgbA} from "../../helpers/colors";
import Grid from "@material-ui/core/Grid";
import {DarkTheme} from "../../themes/DarkTheme";
import ButtonGroup from "../shared/button/ButtonGroup";
import Button from "../shared/button/Button";
import {Variants} from "../shared/constants/variants";
import {Align} from "../shared/constants/align";
import arrayMove from "array-move";
import SortableList from "../shared/list/SortableList";
import Icon from "../shared/icons/Icon";
import ChemicalsListItem from "./ChemicalsListItem";
import GraphCard from "./GraphCard";
import ChemicalSelector from "./ChemicalSelector";
import ProjectContext from "../../contexts/project/ProjectContext";
import ProjectList from "../dataselector/ProjectList";
import MapDecorator from "../decorators/MapDecorator";
import {getNewPlotId} from "../../helpers/common";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Title from "../shared/title/Title";
import Searchbox from "../shared/inputs/Searchbox";
import reduxStore from "../../redux/store";
import {addBoreholeFeature} from "../../redux/actions";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

const DASHBOARD_ITEM_PLOT = 0;
const DASHBOARD_ITEM_PROFILE = 1;
const session = require("./../../../../session/browser/index");

function DashboardContent(props) {
    const [selectedBoreholeIndex, setSelectedBoreholeIndex] = useState(0);
    const [selectedBorehole, setSelectedBorehole] = useState();
    const [dashboardItems, setDashboardItems] = useState([]);
    const [groups, setGroups] = useState([]);
    const [myStations, setMyStations] = useState([]);
    const projectContext = useContext(ProjectContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [filteredMystations, setFilteredMystations] = useState([]);
    const [filteredBorehole, setFilteredBorehole] = useState(
        props.boreholeFeatures.map((item, index) => {
            return {...item, index: index};
        })
    );

    const deleteFromDashboard = (index) => {
        const newBoreholes = props.boreholeFeatures;
        newBoreholes.splice(index, 1);
        reduxStore.dispatch(clearBoreholeFeatures());
        newBoreholes.forEach((feature) => {
            reduxStore.dispatch(addBoreholeFeature(feature));
        });
    };

    const [open, setOpen] = useState({});
    const handleClick = (group) => {
        return () =>
            setOpen((prev_state) => {
                return {...prev_state, [group]: !prev_state[group]};
            });
    };

    const handlePlotSort = ({oldIndex, newIndex}) => {
        let allPlots = arrayMove(props.getAllPlots(), oldIndex, newIndex);
        let activePlots = projectContext.activePlots;
        activePlots = arrayMove(
            activePlots.map((plot) => plot.id),
            oldIndex,
            newIndex
        );
        props.setPlots(allPlots, activePlots);
        props.onActivePlotsChange(activePlots, allPlots, projectContext);
        setDashboardItems(arrayMove(dashboardItems, oldIndex, newIndex));
    };

    const handleRemoveProfile = (key) => {
        let profiles = props.activeProfiles;
        profiles = profiles.filter((profile) => profile.key !== key);
        const activeProfiles = profiles.map((profile) => profile.key);
        props.onActiveProfilesChange(
            activeProfiles,
            props.getAllProfiles(),
            projectContext
        );
    };

    const handleRemovePlot = (id) => {
        let activePlots = props.activePlots;
        let allPlots = props.getAllPlots();
        activePlots = activePlots.filter((plot) => plot.id !== id);
        allPlots = allPlots.filter((plot) => plot.id !== id);
        activePlots = activePlots.map((plot) => plot.id);
        props.onActivePlotsChange(activePlots, allPlots, projectContext);
        props.setPlots(allPlots, activePlots);
    };

    const handleDrop = (id, item) => {
        console.log("item", item)
        setLoadingData(true);
        let plot = props.getAllPlots().filter((p) => {
            if (p.id === id) return true;
        })[0];
        $.ajax({
            url: `/api/sql/jupiter?q=SELECT * FROM ${item.feature.relation} WHERE loc_id=${item.feature.loc_id}&base64=false&lifetime=60&srs=4326`,
            method: "GET",
            dataType: "json",
        }).then(
            (response) => {
                let intakes = [];
                if (!Array.isArray(item.intakeIndex)) {
                    intakes.push(item.intakeIndex);
                } else {
                    intakes = item.intakeIndex;
                }
                for (const itidx of intakes) {
                    let measurementsData = {
                        data: {
                            properties: {
                                _0: JSON.stringify({
                                    unit: item.feature.unit[itidx],
                                    title: item.feature.ts_name[itidx],
                                    intakes: [1],
                                    boreholeno: item.feature.loc_id,
                                    data: response.features[0].properties.data,
                                    trace: item.feature.trace,
                                    relation: item.feature.relation,
                                    parameter: item.feature.parameter[itidx],
                                    ts_id: item.feature.ts_id
                                }),
                                boreholeno: item.feature.loc_id,
                                numofintakes: 1,
                            },
                        },
                    };
                    console.log("measurementsData", measurementsData);
                    item.onAddMeasurement(
                        plot.id,
                        item.gid,
                        item.itemKey,
                        item.intakeIndex,
                        measurementsData,
                        item.feature.relation
                    );
                }
                setLoadingData(false);
            },
            (jqXHR) => {
                console.error(`Error occured while getting data`);
            }
        );
    };

    useEffect(() => {
        window.Calypso = {
            render: (id, popupType, trace, data) => {
                data.properties.relation = popupType; // add relation name to feature properties
                ReactDOM.render(
                    <ThemeProvider>
                        <MapDecorator
                            trace={trace}
                            data={data}
                            getAllPlots={props.getAllPlots}
                            setPlots={props.setPlots}
                            relation={popupType}
                            onActivePlotsChange={props.onActivePlotsChange}
                            setDashboardMode={props.setDashboardMode}
                            setLoadingData={setLoadingData}
                        />
                    </ThemeProvider>,
                    document.getElementById(`pop_up_${id}`)
                );
            },
        };
    });

    useEffect(() => {
        const dashboardItemsCopy = [];
        props.getAllPlots().map((item, index) => {
            dashboardItemsCopy.push({
                type: DASHBOARD_ITEM_PLOT,
                item,
                plotsIndex: index,
            });
        });
        setDashboardItems(dashboardItemsCopy);
    }, [props.activePlots]);

    useEffect(() => {
        $.ajax({
            url: `/api/sql/watsonc?q=SELECT * FROM calypso_stationer.calypso_my_stations WHERE user_id in (${
                session.getProperties()?.organisation.id
            }, ${session.getUserName()}) &base64=false&lifetime=60&srs=4326`,
            method: "GET",
            dataType: "json",
        }).then((response) => {
            var features = response.features;
            var relations = [];
            var loc_ids = [];

            features.forEach((element) => {
                relations = relations.concat(element.properties.relation);

                loc_ids = loc_ids.concat(element.properties.loc_id);
            });

            relations = [...new Set(relations)];
            loc_ids = [...new Set(loc_ids)];
            // var grp = [];
            // var mystat = [];
            relations.forEach((element) => {
                $.ajax({
                    url: `/api/sql/jupiter?q=SELECT the_geom, gid, loc_id, locname, groupname, ts_name, ts_id, unit, parameter, trace FROM ${element} WHERE loc_id in (${loc_ids}) &base64=false&lifetime=60&srs=4326`,
                    method: "GET",
                    dataType: "json",
                }).then((response) => {
                    const grp = response.features.map(
                        (item) => item.properties.groupname
                    );
                    setGroups((prev_state) =>
                        [...new Set([...grp, ...prev_state])].sort(function (a, b) {
                            // equal items sort equally
                            if (a === b) {
                                return 0;
                            }
                            // nulls sort after anything else
                            else if (a === null) {
                                return 1;
                            } else if (b === null) {
                                return -1;
                            }
                            // otherwise, if we're ascending, lowest sorts first
                            else {
                                return a < b ? -1 : 1;
                            }
                        })
                    );

                    const mystat = response.features.map((elem) => {
                        var x = {
                            ...elem.properties,
                            relation: element,
                        };
                        return {...elem, properties: x};
                    });

                    setMyStations((prev_state) =>
                        [...prev_state, ...mystat].sort((a, b) =>
                            a.properties.locname.localeCompare(b.properties.locname)
                        )
                    );
                });
            });
        });
    }, []);

    useEffect(() => {
        setOpen(
            groups.map((elem) => {
                return {[elem]: false};
            })
        );
    }, [groups]);

    useEffect(() => {
        const filt = myStations
            .map((item, index) => {
                return {...item, index: index};
            })
            .filter((elem) =>
                elem.properties.locname.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredMystations(filt);
        const grp = filt
            .map((item) => item.properties.groupname)
            .sort(function (a, b) {
                // equal items sort equally
                if (a === b) {
                    return 0;
                }
                // nulls sort after anything else
                else if (a === null) {
                    return 1;
                } else if (b === null) {
                    return -1;
                }
                // otherwise, if we're ascending, lowest sorts first
                else {
                    return a < b ? -1 : 1;
                }
            });

        setGroups([...new Set(grp)]);
        setFilteredBorehole(
            props.boreholeFeatures
                .map((item, index) => {
                    return {...item, index: index};
                })
                .filter((elem) =>
                    elem.properties.locname
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
        );
    }, [searchTerm, props.boreholeFeatures, myStations]);

    useEffect(() => {
        if (props.boreholeFeatures) {
            if (selectedBoreholeIndex >= props.boreholeFeatures.length) {
                setSelectedBorehole(
                    myStations[selectedBoreholeIndex - props.boreholeFeatures.length]
                );
            } else {
                setSelectedBorehole(props.boreholeFeatures[selectedBoreholeIndex]);
            }
        }
        props.onPlotsChange();
    }, [props.boreholeFeatures, selectedBoreholeIndex]);

    const handleTitleChange = (index) => {
        return (title) => {
            var allPlots = props.getAllPlots();
            allPlots[index] = {
                ...allPlots[index],
                title: title,
            };
            console.log(allPlots);
            let activePlots = allPlots.map((plot) => plot.id);
            props.setPlots(allPlots, activePlots);
        };
    };

    return (
        <Root>
            {props.dashboardContent === "charts" ? (
                <Grid container style={{height: "100%"}}>
                    <Grid item xs={4} style={{height: "100%"}}>
                        <DashboardList>
                            <Grid container style={{height: "100%"}}>
                                <Grid
                                    container
                                    item
                                    xs={5}
                                    style={{height: "100%", overflow: "auto"}}
                                >
                                    <BoreholesList>
                                        <SearchboxContainer>
                                            <Searchbox
                                                placeholder={__("Søg efter datakilder")}
                                                onChange={(value) => setSearchTerm(value)}
                                            />
                                        </SearchboxContainer>
                                        <DashboardListTitle key={"selected_data_sourced"}>
                                            <Icon
                                                name="pin-location-solid"
                                                size={16}
                                                strokeColor={DarkTheme.colors.headings}
                                            />
                                            <Title
                                                level={4}
                                                color={DarkTheme.colors.headings}
                                                text={__("Valgte datakilder")}
                                                marginLeft={8}
                                            />
                                        </DashboardListTitle>
                                        {filteredBorehole
                                            ? filteredBorehole.map((item, index) => {
                                                let name = item.properties.locname;
                                                index = item.index;
                                                let id = item.properties.loc_id + "_" + index;
                                                return (
                                                    <DashboardListItem
                                                        onClick={() => setSelectedBoreholeIndex(index)}
                                                        active={selectedBoreholeIndex === index}
                                                        key={id}
                                                    >
                                                        <Icon
                                                            name="drill"
                                                            size={16}
                                                            strokeColor={DarkTheme.colors.headings}
                                                        />
                                                        <Title level={6} text={name} marginLeft={8}/>
                                                        <RemoveIconContainer
                                                            onClick={() => deleteFromDashboard(index)}
                                                        >
                                                            <Icon
                                                                name="cross"
                                                                size={16}
                                                                strokeColor={DarkTheme.colors.headings}
                                                            />
                                                        </RemoveIconContainer>
                                                    </DashboardListItem>
                                                );
                                            })
                                            : null}
                                        <DashboardListTitle key={"user_data_sourced"}>
                                            <Icon
                                                name="avatar"
                                                size={16}
                                                strokeColor={DarkTheme.colors.headings}
                                            />
                                            <Title
                                                level={4}
                                                color={DarkTheme.colors.headings}
                                                text={__("Mine stationer")}
                                                marginLeft={8}
                                            />
                                        </DashboardListTitle>

                                        {groups.map((group) => {
                                            return (
                                                <div key={group}>
                                                    {group !== null ? (
                                                        <div>
                                                            <DashboardListItem
                                                                onClick={handleClick(group)}
                                                                key={group + "1"}
                                                            >
                                                                {open[group] ? <ExpandLess/> : <ExpandMore/>}
                                                                <Title level={5} text={group} marginLeft={4}/>
                                                            </DashboardListItem>
                                                            <Collapse
                                                                in={open[group]}
                                                                timeout="auto"
                                                                unmountOnExit
                                                            >
                                                                {filteredMystations.map((item, index) => {
                                                                    let name = item.properties.locname;
                                                                    index = item.index;
                                                                    return item.properties.groupname === group ? (
                                                                        <DashboardListItem
                                                                            onClick={() =>
                                                                                setSelectedBoreholeIndex(
                                                                                    index + props.boreholeFeatures.length
                                                                                )
                                                                            }
                                                                            active={
                                                                                selectedBoreholeIndex ===
                                                                                index + props.boreholeFeatures.length
                                                                            }
                                                                            key={item.properties.loc_id}
                                                                        >
                                                                            <Icon
                                                                                name="drill"
                                                                                size={16}
                                                                                strokeColor={DarkTheme.colors.headings}
                                                                                paddingLeft={16}
                                                                            />
                                                                            <Title
                                                                                level={6}
                                                                                text={name}
                                                                                marginLeft={16}
                                                                            />
                                                                        </DashboardListItem>
                                                                    ) : null;
                                                                })}
                                                            </Collapse>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {filteredMystations.map((item, index) => {
                                                                let name = item.properties.locname;
                                                                index = item.index;
                                                                return item.properties.groupname === group ? (
                                                                    <DashboardListItem
                                                                        onClick={() =>
                                                                            setSelectedBoreholeIndex(
                                                                                index + props.boreholeFeatures.length
                                                                            )
                                                                        }
                                                                        active={
                                                                            selectedBoreholeIndex ===
                                                                            index + props.boreholeFeatures.length
                                                                        }
                                                                        key={item.properties.loc_id}
                                                                    >
                                                                        <Icon
                                                                            name="drill"
                                                                            size={16}
                                                                            strokeColor={DarkTheme.colors.headings}
                                                                            // paddingLeft={16}
                                                                        />
                                                                        <Title
                                                                            level={6}
                                                                            text={name}
                                                                            marginLeft={8}
                                                                        />
                                                                    </DashboardListItem>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </BoreholesList>
                                </Grid>
                                <Grid
                                    container
                                    item
                                    xs={7}
                                    style={{
                                        height: "100%",
                                        overflow: "auto",
                                        background: DarkTheme.colors.primary[2],
                                    }}
                                >
                                    <ChemicalSelector
                                        feature={selectedBorehole}
                                        limits={limits}
                                        categories={props.categories}
                                        onAddMeasurement={props.onAddMeasurement}
                                    />
                                </Grid>
                            </Grid>
                        </DashboardList>
                    </Grid>
                    <Grid
                        container
                        item
                        xs={8}
                        style={{height: "100%", overflow: "auto"}}
                    >
                        <ChartsContainer>
                            {loadingData && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        left: "50%",
                                        top: "50%",
                                        position: "absolute",
                                        zIndex: 9000,
                                    }}
                                >
                                    <CircularProgress
                                        style={{color: DarkTheme.colors.interaction[4]}}
                                    />
                                </div>
                            )}
                            <SortableList axis="xy" onSortEnd={handlePlotSort} useDragHandle>
                                {dashboardItems.map((dashboardItem, index) => {
                                    let id = dashboardItem.item.id;
                                    if (dashboardItem.type === DASHBOARD_ITEM_PLOT) {
                                        return (
                                            <GraphCard
                                                plot={dashboardItem.item}
                                                index={index}
                                                key={id}
                                                id={id}
                                                onDeleteMeasurement={props.onDeleteMeasurement}
                                                cardType="plot"
                                                onRemove={() => handleRemovePlot(id)}
                                                onDrop={(item) => handleDrop(id, item)}
                                                onChange={handleTitleChange(index)}
                                            />
                                        );
                                    } else if (dashboardItem.type === DASHBOARD_ITEM_PROFILE) {
                                        return (
                                            <GraphCard
                                                plot={dashboardItem.item}
                                                index={index}
                                                key={index}
                                                cardType="profile"
                                                onRemove={() =>
                                                    handleRemoveProfile(dashboardItem.item.key)
                                                }
                                                onChange={handleTitleChange(index)}
                                            />
                                        );
                                    }
                                })}
                            </SortableList>
                        </ChartsContainer>
                    </Grid>
                </Grid>
            ) : props.dashboardContent === "projects" ? (
                <Grid container>
                    <Grid container item xs={6}>
                        <ProjectsContainer>
                            <ProjectList {...props} showBackButton={true}/>
                        </ProjectsContainer>
                    </Grid>
                </Grid>
            ) : null}
        </Root>
    );
}

const Root = styled.div`
  height: calc(100% - ${(props) => props.theme.layout.gutter * 2}px);
  width: 100%;
  background-color: ${(props) =>
          hexToRgbA(props.theme.colors.primary[1], 0.92)};
  // overflow-y: auto;
`;

const DashboardList = styled.div`
  background-color: ${(props) => props.theme.colors.primary[1]};
  padding: ${(props) => props.theme.layout.gutter / 2}px ${(props) => props.theme.layout.gutter}px;
  width: 100%;
  height: 100%;
  // overflow-y: auto;
`;

const SearchboxContainer = styled.div`
  width: 90%;
  padding: ${(props) => props.theme.layout.gutter / 2}px 0px;
`;

const BoreholesList = styled.div`
  width: 100%;
  height: 100%;
  // overflow-y: auto;
`;

const DashboardListTitle = styled.div`
  margin-top: ${(props) => props.theme.layout.gutter / 4}px;
  width: 100%;
  color: ${(props) => props.theme.colors.headings};
`;

const SelectedList = styled.div`
  display: flex;
  flex-direction: row;
`;

const RemoveIconContainer = styled.div`
  width: 18px;
  height: 18px;
  margin-top: 3px;
  margin-right: 5px;
  border: 1px solid ${(props) => props.theme.colors.gray[2]};
  border-radius: 50%;
  display: none;
  cursor: pointer;
  float: right;
`;

const DashboardListItem = styled.div`
  margin-top: ${(props) => props.theme.layout.gutter / 8}px;
  margin-bottom: ${(props) => props.theme.layout.gutter / 8}px;
  height: ${(props) => props.theme.layout.gutter}px;
  padding: ${(props) => props.theme.layout.gutter / 8}px 0px;
  width: 100%;
  color: ${(props) =>
          props.active ? props.theme.colors.headings : props.theme.colors.gray[4]};
  background-color: ${(props) =>
          props.active ? props.theme.colors.primary[2] : "transparent"};
  cursor: pointer;
  display: inline-block;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary[2]};
    color: ${(props) => props.theme.colors.headings};

    ${RemoveIconContainer} {
      display: block;
    }
  }
`;

const FavoritterList = styled.div`
  margin-top: ${(props) => props.theme.layout.gutter}px;
  height: auto;
`;

const FavoritterListTitle = styled.div`
  color: ${(props) => props.theme.colors.primary[5]};
  margin-top: ${(props) => props.theme.layout.gutter / 2}px;
`;

const ChartsContainer = styled.ul`
  padding-top: 0px;
  padding-bottom: 0px;
  width: 100%;
  padding-left: ${(props) => props.theme.layout.gutter / 4}px;
  padding-right: ${(props) => props.theme.layout.gutter / 4}px;
  height: 100%;
  position: relative;
`;

const ProjectsContainer = styled.div`
  padding: ${(props) => props.theme.layout.gutter / 2}px;
  width: 80%;
`;

const mapStateToProps = (state) => ({
    boreholeFeatures: state.global.boreholeFeatures,
    dashboardContent: state.global.dashboardContent,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContent);
