import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import Grid from "@material-ui/core/Grid";
import Icon from "../shared/icons/Icon";
import Title from "../shared/title/Title";
import Button from "../shared/button/Button";
import { Variants } from "../shared/constants/variants";
import { LIMIT_CHAR } from "../../constants";
import { Size } from "../shared/constants/size";
import CheckBox from "../shared/inputs/CheckBox";
import PlotComponent from "./PlotComponent";
import CardListItem from "./CardListItem";

const utils = require("../../utils");

function DashboardPlotCard(props) {
  const [plotData, setPlotData] = useState([]);
  const [yAxis2LayoutSettings, setYAxis2LayoutSettings] = useState(null);
  const [aggregate, setAggregate] = useState([]);
  const [collectedProps, drop] = useDrop(() => ({
    accept: "MEASUREMENT",
    drop: props.onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleSetAggregate = (idx, window, func) => {
    let ind = aggregate.findIndex((elem) => elem.idx === idx);
    if (ind === -1) {
      setAggregate((prev) => {
        prev.push({ idx: idx, window: window, func: func });
        return [...prev];
      });
    } else {
      setAggregate((prev) => {
        prev[ind] = { idx: idx, window: window, func: func };
        return [...prev];
      });
    }
  };

  const handleDeleteAggregate = (idx) => {
    let ind = aggregate.findIndex((elem) => elem.idx === idx);
    if (ind === -1) {
      return;
    } else {
      setAggregate((prev) => {
        prev.splice(ind, 1);
        return [...prev];
      });
    }
  };

  useEffect(() => {
    let data = [];
    if (
      props.plot &&
      props.plot.measurements &&
      props.plot.measurements.length > 0
    ) {
      props.plot.measurements.map((measurementLocationRaw, index) => {
        if (
          props.plot.measurementsCachedData &&
          measurementLocationRaw in props.plot.measurementsCachedData &&
          props.plot.measurementsCachedData[measurementLocationRaw] &&
          props.plot.measurementsCachedData[measurementLocationRaw].data
        ) {
          let measurementLocation = measurementLocationRaw.split(":");
          let feature =
            props.plot.measurementsCachedData[measurementLocationRaw].data;
          let key = measurementLocation[1];
          let intakeIndex = measurementLocation[2];
          let measurementData = JSON.parse(feature.properties[key]);
          console.log(measurementData);
          // Merge trace and data
          const plotInfoMergedWithTrace = {
            ...measurementData.data[intakeIndex],
            ...measurementData.trace[intakeIndex],
          };
          data.push(plotInfoMergedWithTrace);
        } else {
          console.info(
            `Plot does not contain measurement ${measurementLocationRaw}`
          );
        }
      });
    }
    setPlotData(data);
    setYAxis2LayoutSettings(yAxis2LayoutSettings);
  }, [props.plot]);

  return (
    <DashboardPlotContent ref={drop}>
      <Grid container>
        <Grid container item xs={2}>
          <CardList>
            {props.plot?.measurements?.map((measurement, index) => {
              return (
                <CardListItem
                  measurement={measurement}
                  plot={props.plot}
                  onDeleteMeasurement={props.onDeleteMeasurement}
                  key={measurement}
                  setAggregate={handleSetAggregate}
                  deleteAggregate={handleDeleteAggregate}
                />
              );
            })}
          </CardList>
        </Grid>
        <Grid container item xs={10}>
          <PlotContainer>
            <PlotComponent
              viewMode={0}
              height={props.plotHeight ? props.plotHeight : 370}
              index={props.index}
              onDelete={() => console.log("Testing")}
              plotMeta={props.plot}
              plotData={plotData}
              aggregate={aggregate}
              yAxis2LayoutSettings={yAxis2LayoutSettings}
            />
          </PlotContainer>
        </Grid>
      </Grid>
    </DashboardPlotContent>
  );
}

const DashboardPlotContent = styled.div`
  padding: ${(props) => props.theme.layout.gutter / 2}px;
  height: 100%;
`;

const CardList = styled.div`
  height: 100%;
  width: 95%;
  vertical-align: middle;
`;

const PlotContainer = styled.div`
  width: 100%;
  margin-left: 10px;
`;

export default DashboardPlotCard;
