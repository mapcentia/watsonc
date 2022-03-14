import { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";

function ChemicalsListItem(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "MEASUREMENT",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: {
      gid: props.gid,
      itemKey: props.itemKey,
      intakeIndex: props.intakeIndex,
      onAddMeasurement: props.onAddMeasurement,
      feature: props.feature,
    },
  }));
  const [descriptionText, setDescriptionText] = useState("");

  useEffect(() => {
    // TODO brug nyt felt
    let description = "";
    setDescriptionText("ohyeah");
  }, [
    props.detectionLimitReachedForMax,
    props.maxMeasurement,
    props.detectionLimitReachedForLatest,
    props.latestMeasurement,
    props.unit,
  ]);
  return (
    <Root
      title={__(`Drag and drop measurement to add it to time series`)}
      ref={drag}
      data-gid="{props.boreholeno}"
      data-key="{props.itemKey}"
      data-intake-index="{props.intakeIndex}"
    >
      <Grid container>
        <Grid container item xs={1}>
          <IconContainer>
            <Icon name="drag-handle-solid" size={24} />
          </IconContainer>
        </Grid>
        {/*<Grid container item xs={1} justify="center">*/}
        {/*  <CircleImage src={props.icon} />*/}
        {/*</Grid>*/}
        <Grid container item xs={9}>
          <LabelRow>
            <Title level={6} text={props.label} />
          </LabelRow>
          <LabelRow>
            <Title
              level={6}
              text={props.description}
              color={DarkTheme.colors.gray[3]}
            />
          </LabelRow>
        </Grid>
      </Grid>
    </Root>
  );
}

const Root = styled.div`
  color: ${(props) => props.theme.colors.headings};
  margin-top: ${(props) => props.theme.layout.gutter / 8}px;
  padding: ${(props) => props.theme.layout.gutter / 8}px 0;
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  cursor: move;
  &:hover {
    background: ${(props) => props.theme.colors.primary[5]};
    & svg {
      color: ${(props) => props.theme.colors.primary[2]};
    }
  }
`;

const IconContainer = styled.div`
  color: ${(props) => props.theme.colors.gray[4]};
`;

const CircleImage = styled.img`
  height: 11px;
  width: 11px;
  border-radius: 50%;
  display: inline-block;
  margin-top: ${(props) => props.theme.layout.gutter / 4}px;
`;

const LabelRow = styled.div`
  width: 100%;
  display: block;
`;

const measurementSource = {
  beginDrag(props) {
    return {
      gid: props.gid,
      itemKey: props.itemKey,
      intakeIndex: props.intakeIndex,
      onAddMeasurement: props.onAddMeasurement,
    };
  },
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
};

export default ChemicalsListItem;
