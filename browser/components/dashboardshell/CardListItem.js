import { useState, useEffect } from "react";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import Icon from "../shared/icons/Icon";
import Title from "../shared/title/Title";

const utils = require("../../utils");

const options = [
  { index: 0, text: "Døgnmiddel", window: "day", func: "mean" },
  { index: 1, text: "Ugemiddel", window: "week", func: "mean" },
  { index: 2, text: "Månedmiddel", window: "month", func: "mean" },

  { index: 3, text: "Døgnsum", window: "day", func: "sum" },
  { index: 4, text: "Ugesum", window: "week", func: "sum" },
  { index: 5, text: "Månedsum", window: "month", func: "sum" },
];

function CardListItem(props) {
  const [name, setName] = useState("");
  const [infoForDeletion, setInfoForDeletion] = useState({});
  const [useSumInsteadOfMean, setUseSumInsteadOfMean] = useState(false);
  useEffect(() => {
    if (props.measurement) {
      let splitMeasurement = props.measurement.split(":");
      let measurementLength = splitMeasurement.length;
      let key = null;
      let feature = null;
      let intakeIndex = null;
      let boreholeno = splitMeasurement[0];
      if (measurementLength === 3) {
        key = splitMeasurement[1];
        intakeIndex = splitMeasurement[2];
      } else if (measurementLength === 4) {
        key = splitMeasurement[1] + ":" + splitMeasurement[2];
        intakeIndex = splitMeasurement[3];
      }
      if (
        props.plot.measurementsCachedData &&
        props.plot.measurementsCachedData[props.measurement]
      ) {
        feature = props.plot.measurementsCachedData[props.measurement].data;
        let measurementData = JSON.parse(feature.properties[key]);
        const NAME = measurementData.title
          ? `${measurementData.locname} ${measurementData.title}, ${measurementData.parameter}`
          : `${measurementData.locname}, ${measurementData.parameter}`;
        setName(NAME);
        if (measurementData.data[intakeIndex].tstype_id === 4) {
          setUseSumInsteadOfMean(true);
        }
        // setName(`${measurementData.title} (${measurementData.unit})`);
      }
      setInfoForDeletion({
        plotId: props.plot.id,
        boreholeno,
        key,
        intakeIndex,
      });
    }
  }, [props.measurement, props.plot]);

  return (
    <Root>
      <Grid container>
        {/* <Grid container item xs={6}>
          <CardListLabel>
            <Title level={6} text={name} marginLeft={8} />
          </CardListLabel>
        </Grid> */}
        <Grid container item xs={11}>
          <Select
            onChange={(e) => {
              if (e.target.value === "") {
                props.deleteAggregate(props.measurement);
              } else {
                props.setAggregate(
                  props.measurement,
                  options[e.target.value].window,
                  options[e.target.value].func
                );
              }
            }}
          >
            <option value="" hidden>
              {name}
            </option>
            {useSumInsteadOfMean
              ? options
                  .filter((elem) => elem.func === "sum")
                  .map((elem) => {
                    return (
                      <option value={elem.index} key={elem.index}>
                        {name + " - " + elem.text}
                      </option>
                    );
                  })
              : options
                  .filter((elem) => elem.func === "mean")
                  .map((elem) => {
                    return (
                      <option value={elem.index} key={elem.index}>
                        {name + " - " + elem.text}
                      </option>
                    );
                  })}
          </Select>
          {/* <button
            onClick={() => {
              console.log(props);
              props.setAggregate(props.measurement, "day", "mean");
            }}
          >
            Tryk
          </button> */}
        </Grid>
        <Grid container item xs={1} justify="flex-end">
          <RemoveIconContainer
            onClick={() => {
              props.deleteAggregate(props.measurement);
              props.onDeleteMeasurement(
                infoForDeletion.plotId,
                infoForDeletion.boreholeno,
                infoForDeletion.key,
                infoForDeletion.intakeIndex
              );
            }}
          >
            <Icon name="cross" size={16} />
          </RemoveIconContainer>
        </Grid>
      </Grid>
    </Root>
  );
}

const RemoveIconContainer = styled.div`
  width: 18px;
  height: 18px;
  margin-top: 3px;
  border: 1px solid ${(props) => props.theme.colors.gray[2]};
  border-radius: 50%;
  display: none;
  cursor: pointer;
`;

const Root = styled.div`
  width: 100%;
  padding: ${(props) => props.theme.layout.gutter / 8}px;
  vertical-align: middle;
  height: ${(props) => props.theme.layout.gutter}px;
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  &:hover {
    background: ${(props) => props.theme.colors.gray[4]};
    ${RemoveIconContainer} {
      display: block;
    }
  }
`;

const CardListLabel = styled.div`
  vertical-align: middle;
  display: inline-block;
  //   margin-left: ${(props) => props.theme.layout.gutter / 4}px;
`;

const Select = styled.select`
  width: 100%;
  height: ${(props) =>
    props.theme.layout.gutter - props.theme.layout.gutter / 8 + 2}px;
  background: transparent;
  padding-left: 5px;
  font: ${(props) => props.theme.fonts.label};
  border: none;
  margin-left: 10px;
  word-wrap: break-word;
  text-overflow: inherit;
  white-space: normal;

  option {
    color: black;
    background: transparent;
    display: flex;
    white-space: pre;
    min-height: 20px;
    padding: 0px 2px 1px;
  }

  s
`;

export default CardListItem;
