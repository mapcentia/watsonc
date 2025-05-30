import styled from "styled-components";
import { DarkTheme } from "../../themes/DarkTheme";
import { useContext, useState, useEffect } from "react";
import Title from "../shared/title/Title";
import Button from "../shared/button/Button";
import ButtonGroup from "../shared/button/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import { Variants } from "../shared/constants/variants";
import { Size } from "../shared/constants/size";
import { Align } from "../shared/constants/align";
import Icon from "../shared/icons/Icon";
import ProjectContext from "../../contexts/project/ProjectContext";
import reduxStore from "../../redux/store";
import { addBoreholeFeature } from "../../redux/actions";
import { getNewPlotId } from "../../helpers/common";
import ImageCarousel from "../shared/images/ImageCarousel";
import { showSubscriptionIfFree } from "../../helpers/show_subscriptionDialogue";
import InfoComponent from "./InfoComponent";
import { useDashboardStore } from "../../zustand/store";

const session = require("./../../../../session/browser/index");

function MapDecorator(props) {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [dashboardItems, setDashboardItems] = useDashboardStore((state) => [
    state.dashboardItems,
    state.setDashboardItems,
  ]);
  const [moreInfo, setMoreInfo] = useState(
    props.data.properties.location_info
      ? props.data.properties.location_info
      : []
  );

  useEffect(() => {
    $.ajax({
      url: `/api/sql/watsonc?q=SELECT ts_info FROM calypso_stationer.location_info_timeseries WHERE loc_id='${props.data.properties.loc_id}'&base64=false&lifetime=60&srs=4326`,
      method: "GET",
      dataType: "json",
    }).then(
      (response) => {
        let data = response.features[0].properties;

        setMoreInfo((prev) => [
          ...prev,
          { type: "header", value: "Tidsserie info" },
          ...JSON.parse(data.ts_info),
        ]);
      },
      (jqXHR) => {
        console.error(`Error occured while getting data`);
      }
    );
  }, []);

  const plot = () => {
    props.setLoadingData(true);
    let plot = props.data.properties;
    const allPlots = dashboardItems.map((dashboardItem) => dashboardItem.item);
    let plotData = {
      id: `plot_${getNewPlotId(allPlots)}`,
      title: props.data.properties.locname,
      measurements: [],
      relations: {},
      measurementsCachedData: {},
    };

    allPlots.unshift(plotData);

    $.ajax({
      url: `/api/sql/jupiter?q=SELECT * FROM ${props.relation} WHERE loc_id='${props.data.properties.loc_id}'&base64=false&lifetime=60&srs=4326`,
      method: "GET",
      dataType: "json",
    }).then(
      (response) => {
        let data = response.features[0].properties;
        var indices = [];
        if (typeof plot.compound_list != "undefined") {
          let idx = plot.compound_list.indexOf(plot.compound);
          while (idx != -1) {
            indices.push(idx);
            idx = plot.compound_list.indexOf(plot.compound, idx + 1);
          }
        } else {
          indices = [...Array(data.data.length).keys()];
        }

        for (const u of indices) {
          const measurement = plot.loc_id + ":_0:" + plot.ts_id[u];
          plotData.relations[measurement] = props.relation;
          plotData.measurements.push(measurement);
          plotData.measurementsCachedData[measurement] = {
            data: {
              properties: {
                _0: JSON.stringify({
                  unit: data.unit[u],
                  title: data.ts_name[u],
                  locname: data.locname,
                  intakes: [1],
                  boreholeno: data.loc_id,
                  data: data.data,
                  trace: data.trace,
                  relation: props.relation,
                  parameter: data.parameter[u],
                  ts_id: data.ts_id,
                  ts_name: data.ts_name,
                }),
                boreholeno: data.loc_id,
                numofintakes: 1,
              },
            },
          };
        }
        setDashboardItems(
          allPlots.map((plot, index) => {
            return {
              type: plot.id ? 0 : 1,
              item: plot,
              plotsIndex: index,
            };
          })
        );
        props.setLoadingData(false);
      },
      (jqXHR) => {
        console.error(`Error occured while getting data`);
      }
    );
  };
  const addToDashboard = () => {
    reduxStore.dispatch(addBoreholeFeature(props.data));
  };
  let links = [];

  if (typeof props.data.properties.compound_list != "undefined") {
    const indices = [];
    let idx = props.data.properties.compound_list.indexOf(
      props.data.properties.compound
    );
    while (idx != -1) {
      indices.push(idx);
      idx = props.data.properties.compound_list.indexOf(
        props.data.properties.compound,
        idx + 1
      );
    }
    links.push(
      indices.map((elem, index) => {
        return (
          <Grid container key={index}>
            <Icon
              name="analytics-board-graph-line"
              strokeColor={DarkTheme.colors.headings}
              size={16}
            />
            <Title
              marginTop={0}
              marginLeft={4}
              level={5}
              color={DarkTheme.colors.headings}
              text={
                props.data.properties.ts_name[elem]
                  ? props.data.properties.ts_name[elem] +
                    ", " +
                    props.data.properties.parameter[elem]
                  : props.data.properties.parameter[elem]
              }
            />
          </Grid>
        );
      })
    );
  } else {
    links.push(
      props.data.properties.ts_name.map((v, index) => {
        return (
          <Grid container key={index}>
            <Icon
              name="analytics-board-graph-line"
              strokeColor={DarkTheme.colors.headings}
              size={16}
            />
            <Title
              marginTop={0}
              marginLeft={4}
              level={5}
              color={DarkTheme.colors.headings}
              text={
                v
                  ? v + ", " + props.data.properties.parameter[index]
                  : props.data.properties.parameter[index]
              }
            />
          </Grid>
        );
      })
    );
  }
  return (
    <Root>
      {showMoreInfo ? (
        <>
          {/* <LabelsContainer>
            <Title
              level={4}
              text={props.data.properties.locname}
              color={DarkTheme.colors.headings}
            />
          </LabelsContainer> */}
          <LabelsContainer>
            <InfoComponent info={moreInfo} />
          </LabelsContainer>
          <ButtonGroup
            align={Align.Right}
            marginTop={16}
            marginRight={16}
            marginLeft={16}
            spacing={2}
          >
            <Button
              text={__("Tidsserier")}
              variant={Variants.Transparent}
              size={Size.Small}
              onClick={() => setShowMoreInfo(false)}
              disabled={false}
            />
          </ButtonGroup>
        </>
      ) : (
        <>
          {/* <RatingStarContainer>
            <Icon
              name="rating-star-solid"
              strokeColor={DarkTheme.colors.headings}
              size={16}
            />
          </RatingStarContainer> */}

          <ImageCarousel images={props.data.properties.images} />
          {/* <Img src={props.data.properties.images[0]} /> */}

          <LabelsContainer>
            <Title
              level={4}
              text={props.data.properties.locname}
              color={DarkTheme.colors.headings}
            />
            <br />
            <Title
              level={6}
              color={DarkTheme.colors.primary[5]}
              text={__("Tidsserier")}
              marginTop={16}
            />
          </LabelsContainer>
          <LinksContainer>{links}</LinksContainer>
          <ButtonGroup
            align={Align.Center}
            marginTop={16}
            marginRight={16}
            marginLeft={16}
            spacing={2}
          >
            <Button
              text={__("Vis alle tidsserier")}
              variant={Variants.Primary}
              size={Size.Small}
              onClick={() => {
                if (showSubscriptionIfFree(props.getAllPlots().length > 0))
                  return;
                addToDashboard();
                plot();
                props.setDashboardMode("half");
              }}
              disabled={false}
            />
            <Button
              text={__("Tilføj til Dashboard")}
              variant={Variants.Primary}
              size={Size.Small}
              onClick={() => {
                addToDashboard();
                props.setDashboardMode("half");
              }}
              disabled={false}
            />
            {moreInfo.length > 0 && (
              <Button
                text={__("Mere info")}
                variant={Variants.Transparent}
                size={Size.Small}
                onClick={() => setShowMoreInfo(true)}
                disabled={false}
              />
            )}
          </ButtonGroup>
        </>
      )}
    </Root>
  );
}

const Root = styled.div`
  width: 100%;
  // height: 600px;
  background-color: ${(props) => props.theme.colors.primary[2]};
  border-radius: ${(props) => props.theme.layout.borderRadius.medium}px;
  padding-top: 10px;
  padding-bottom: 10px;

  img {
    border-radius: ${(props) => props.theme.layout.borderRadius.medium}px;
  }
`;

const Img = styled.img`
  width: 100%;
  height: 125px;
`;

const LabelsContainer = styled.div`
  margin-top: ${(props) => props.theme.layout.gutter / 4}px;
  padding-left: ${(props) => props.theme.layout.gutter / 2}px;
`;

const LinksContainer = styled.div`
  margin-top: 8px;
  padding-left: 16px;

  > div {
    margin-top: 8px;
  }
`;

const RatingStarContainer = styled.div`
  position: absolute;
  top: ${(props) => props.theme.layout.gutter / 4}px;
  right: ${(props) => props.theme.layout.gutter / 4}px;
`;

export default MapDecorator;
