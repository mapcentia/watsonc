import { useState, useEffect, useContext, useCallback } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { hexToRgbA } from "../../helpers/colors";
import Grid from "@material-ui/core/Grid";
import { DarkTheme } from "../../themes/DarkTheme";
import ButtonGroup from "../shared/button/ButtonGroup";
import Button from "../shared/button/Button";
import { Variants } from "../shared/constants/variants";
import { Align } from "../shared/constants/align";
import arrayMove from "array-move";
import SortableList from "../shared/list/SortableList";
import Icon from "../shared/icons/Icon";
import ChemicalsListItem from "./ChemicalsListItem";
import GraphCard from "./GraphCard";
import ChemicalSelector from "./ChemicalSelector";
import ProjectContext from "../../contexts/project/ProjectContext";
import ProjectList from "../dataselector/ProjectList";
import MapDecorator from "../decorators/MapDecorator";
import { getNewPlotId } from "../../helpers/common";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Title from "../shared/title/Title";

const DASHBOARD_ITEM_PLOT = 0;
const DASHBOARD_ITEM_PROFILE = 1;
// const session = require("./../../../../session/browser/index");

function DashboardContent(props) {
  const [selectedBoreholeIndex, setSelectedBoreholeIndex] = useState(0);
  const [selectedBorehole, setSelectedBorehole] = useState();
  const [dashboardItems, setDashboardItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [myStations, setMyStations] = useState([]);
  const projectContext = useContext(ProjectContext);
  const [orgId, setorgId] = useState(null);

  const [open, setOpen] = useState({});

  // TODO ændrer dette til at få org id fra Session
  useEffect(() => {
    $.ajax({
      dataType: "json",
      url: "/api/session/status",
      type: "GET",
      success: function (data) {
        setorgId(data.status.properties.organisation.id);
      },
    });
  }, []);

  const handleClick = (group) => {
    return () =>
      setOpen((prev_state) => {
        return { ...prev_state, [group]: !prev_state[group] };
      });
  };

  const handlePlotSort = ({ oldIndex, newIndex }) => {
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
    // TODO Lazy load
    console.log("LAZY LOAD");
    let plot = props.getAllPlots().filter((p) => {
      if (p.id === id) return true;
    })[0];
    $.ajax({
      url: `/api/sql/jupiter?q=SELECT * FROM ${item.feature.relation} WHERE loc_id=${item.feature.loc_id}&base64=false&lifetime=60&srs=4326`,
      method: "GET",
      dataType: "json",
    }).then(
      (response) => {
        let measurementsData = {
          data: {
            properties: {
              _0: JSON.stringify({
                unit: item.feature.unit[item.intakeIndex],
                title: item.feature.ts_name[item.intakeIndex],
                intakes: [1],
                boreholeno: item.feature.loc_id,
                data: response.features[0].properties.data,
                trace: item.feature.trace,
                relation: item.feature.relation,
              }),
              boreholeno: item.feature.loc_id,
              numofintakes: 1,
            },
          },
        };
        item.onAddMeasurement(
          plot.id,
          item.gid,
          item.itemKey,
          item.intakeIndex,
          measurementsData
        );
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
            />
          </ThemeProvider>,
          document.getElementById(`pop_up_${id}`)
        );
      },
    };
  });

  useEffect(() => {
    console.log("props.activePlots", props.activePlots);
    const dashboardItemsCopy = [];

    props.activePlots.map((item, index) => {
      dashboardItemsCopy.push({
        type: DASHBOARD_ITEM_PLOT,
        item,
        plotsIndex: index,
      });
    });
    setDashboardItems(dashboardItemsCopy);
  }, [props.activePlots]);

  //TODO skift orgId ud med det der kan fåes fra session
  useEffect(() => {
    console.log(props);
    $.ajax({
      url: `/api/sql/watsonc?q=SELECT * FROM calypso_stationer.calypso_my_stations WHERE user_id in (${
        props.session.getProperties().organisation.id
      }, ${props.session.getUserName()}) &base64=false&lifetime=60&srs=4326`,
      method: "GET",
      dataType: "json",
    }).then((response) => {
      console.log(response);
      var features = response.features;
      var relations = [];
      var loc_ids = [];
      console.log(features);
      features.forEach((element) => {
        relations = relations.concat(element.properties.relation);

        loc_ids = loc_ids.concat(element.properties.loc_id);
      });

      relations = [...new Set(relations)];
      loc_ids = [...new Set(loc_ids)];
      // var grp = [];
      // var mystat = [];
      console.log(relations);
      console.log(loc_ids);
      relations.forEach((element) => {
        console.log(loc_ids);
        $.ajax({
          url: `/api/sql/jupiter?q=SELECT the_geom, gid, loc_id, locname, groupname, ts_name, ts_id, unit, parameter, trace FROM ${element} WHERE loc_id in (${loc_ids}) &base64=false&lifetime=60&srs=4326`,
          method: "GET",
          dataType: "json",
        }).then((response) => {
          console.log(response);
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
            return { ...elem, properties: x };
          });

          setMyStations((prev_state) =>
            [...prev_state, ...mystat].sort((a, b) =>
              a.properties.locname.localeCompare(b.properties.locname)
            )
          );
        });
      });
      // console.log(grp);
      // console.log(mystat);
      // setGroups([...new Set(grp)]);
      // setMyStations(mystat);
    });
  }, [orgId]);

  useEffect(() => {
    setOpen(
      groups.map((elem) => {
        return { [elem]: false };
      })
    );
    console.log(groups);
  }, [groups]);

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
  }, [props.boreholeFeatures, selectedBoreholeIndex]);

  return (
    <Root>
      {props.dashboardContent === "charts" ? (
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={4} style={{ height: "100%" }}>
            <DashboardList>
              <Grid container style={{ height: "100%" }}>
                <Grid
                  container
                  item
                  xs={5}
                  style={{ height: "100%", overflow: "auto" }}
                >
                  <BoreholesList>
                    <DashboardListTitle>
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
                    {props.boreholeFeatures
                      ? props.boreholeFeatures.map((item, index) => {
                          let name = item.properties.locname;
                          return (
                            <DashboardListItem
                              onClick={() => setSelectedBoreholeIndex(index)}
                              active={selectedBoreholeIndex === index}
                              key={item.properties.locid}
                            >
                              <Icon
                                name="drill"
                                size={16}
                                strokeColor={DarkTheme.colors.headings}
                              />
                              <Title level={6} text={name} marginLeft={8} />
                            </DashboardListItem>
                          );
                        })
                      : null}
                    {/*<FavoritterList>*/}
                    {/*    <DashboardListTitle>*/}
                    {/*        <Icon name="star-solid" size={16}/>*/}
                    {/*        <Title level={4} text={__('Favoritter')} marginLeft={8}/>*/}
                    {/*    </DashboardListTitle>*/}
                    {/*    <FavoritterListTitle>*/}
                    {/*        <Icon name="drill-space-solid" size={16}/>*/}
                    {/*        <Title level={5} text={__('Kildeplads')} marginLeft={8}/>*/}
                    {/*    </FavoritterListTitle>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text='13.344' marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text='13.947' marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text='13.478' marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <FavoritterListTitle>*/}
                    {/*        <Icon name="folder-solid" size={16}/>*/}
                    {/*        <Title level={5} text={__('Omrade B')} marginLeft={8}/>*/}
                    {/*    </FavoritterListTitle>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 213.312')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 243.442')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 745.553')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <FavoritterListTitle>*/}
                    {/*        <Icon name="folder-solid" size={16}/>*/}
                    {/*        <Title level={5} text={__('Omrade C')} marginLeft={8}/>*/}
                    {/*    </FavoritterListTitle>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 773.312')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 883.442')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*    <DashboardListItem>*/}
                    {/*        <Icon name="water-wifi-solid" size={8}*/}
                    {/*              strokeColor={DarkTheme.colors.headings}/>*/}
                    {/*        <Title level={6} text={__('Lokalitet 799.553')} marginLeft={8}/>*/}
                    {/*    </DashboardListItem>*/}
                    {/*</FavoritterList>*/}

                    <DashboardListTitle>
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
                                {open[group] ? <ExpandLess /> : <ExpandMore />}
                                <Title level={5} text={group} marginLeft={4} />
                              </DashboardListItem>
                              <Collapse
                                in={open[group]}
                                timeout="auto"
                                unmountOnExit
                              >
                                {myStations.map((item, index) => {
                                  let name = item.properties.locname;
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
                                      key={item.properties.locid}
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
                              {myStations.map((item, index) => {
                                let name = item.properties.locname;
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
                                    key={item.properties.locid}
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

                    {/* <DashboardListItem
                      onClick={handleClick}
                      key={1254123123123}
                    >
                      <Title level={6} text="Gruppe" marginLeft={8} />
                    </DashboardListItem>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      {myStations.length > 0
                        ? myStations.map((item, index) => {
                            let name = item.properties.locname;
                            return (
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
                                key={item.properties.locid}
                              >
                                <Icon
                                  name="drill"
                                  size={16}
                                  strokeColor={DarkTheme.colors.headings}
                                />
                                <Title level={6} text={name} marginLeft={8} />
                              </DashboardListItem>
                            );
                          })
                        : null}
                    </Collapse> */}
                  </BoreholesList>
                </Grid>
                <Grid
                  container
                  item
                  xs={7}
                  style={{ height: "100%", overflow: "auto" }}
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
            style={{ height: "100%", overflow: "auto" }}
          >
            <ChartsContainer>
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
              <ProjectList {...props} showBackButton={true} />
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
  padding: ${(props) => props.theme.layout.gutter / 2}px
    ${(props) => props.theme.layout.gutter}px;
  width: 100%;
  height: 100%;
  // overflow-y: auto;
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

  &:hover {
    background-color: ${(props) => props.theme.colors.primary[2]};
    color: ${(props) => props.theme.colors.headings};
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
