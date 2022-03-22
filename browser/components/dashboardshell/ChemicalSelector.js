import { useState, useEffect } from "react";
import { connect } from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import styled from "styled-components";
import Searchbox from "../shared/inputs/Searchbox";
import ChemicalsListItem from "./ChemicalsListItem";

function ChemicalSelector(props) {
  const [chemicalsList, setChemicalsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState({});

  const toggleOpenItem = (key) => {
    setOpenItems({ ...openItems, [key]: !!!openItems[key] });
  };

  useEffect(() => {
    if (!props.feature || !props.feature.properties) {
      return;
    }
    let plottedProperties = [];
    let categories = JSON.parse(JSON.stringify(props.categories));
    var parameters = props.feature.properties.parameter;
    for (let i = 0; i < parameters.length; i++) {
      plottedProperties.push({
        key: props.feature.properties.ts_name[i] + "_" + i,
        intakeIndex: i,
        boreholeno: props.feature.properties.loc_id,
        title: props.feature.properties.ts_name[i],
        unit: props.feature.properties.unit[i],
        parameter: props.feature.properties.parameter[i],
        measurements: [],
        timeOfMeasurement: [],
      });
    }

    const createMeasurementControl = (item, key) => {
      let display = true;

      let control = false;
      if (display) {
        let json = item;

        let intakeName = `#` + (parseInt(item.intakeIndex) + 1);
        if (
          `intakes` in json &&
          Array.isArray(json.intakes) &&
          json.intakes[item.intakeIndex] !== null
        ) {
          intakeName = json.intakes[item.intakeIndex] + "";
        }

        let icon = false;
        let measurementData = null;
        if (!item.custom) {
          // measurementData = evaluateMeasurement(json, props.limits, item.key, item.intakeIndex);
          // icon = measurementIcon.generate(measurementData.maxColor, measurementData.latestColor);
          //icon = measurementIcon.generate(/)
        }

        control = (
          <ChemicalsListItem
            label={
              item.title
                ? item.title + " " + item.parameter + ", (" + item.unit + ")"
                : item.parameter + ", (" + item.unit + ")"
            }
            circleColor={DarkTheme.colors.denotive.warning}
            key={key}
            onAddMeasurement={props.onAddMeasurement}
            // maxMeasurement={measurementData === null ? null : Math.round((measurementData.maxMeasurement) * 100) / 100}
            // latestMeasurement={measurementData === null ? null : Math.round((measurementData.latestMeasurement) * 100) / 100}
            // latestMeasurementRelative={measurementData === null ? null : Math.round((measurementData.latestMeasurement / measurementData.chemicalLimits[1]) * 100) / 100}
            // detectionLimitReachedForMax={measurementData === null ? null : measurementData.detectionLimitReachedForMax}
            // detectionLimitReachedForLatest={measurementData === null ? null : measurementData.detectionLimitReachedForLatest}
            description={item.parameter + ", (" + item.unit + ")"}
            icon={icon}
            gid={props.feature.properties.loc_id}
            itemKey={item.key}
            intakeIndex={item.intakeIndex}
            intakeName={intakeName}
            unit={item.unit}
            title={item.title}
            feature={props.feature.properties}
          />
        );
      }

      return control;
    };

    let propertiesControls = [];
    let searchTermLower = searchTerm.toLowerCase();

    if (plottedProperties.length < 10) {
      let allChems = (
        <ChemicalsListItem
          label={"Alle parametre"}
          circleColor={DarkTheme.colors.denotive.warning}
          key={"allParameters" + "_" + props.feature.properties.loc_id}
          onAddMeasurement={props.onAddMeasurement}
          // maxMeasurement={measurementData === null ? null : Math.round((measurementData.maxMeasurement) * 100) / 100}
          // latestMeasurement={measurementData === null ? null : Math.round((measurementData.latestMeasurement) * 100) / 100}
          // latestMeasurementRelative={measurementData === null ? null : Math.round((measurementData.latestMeasurement / measurementData.chemicalLimits[1]) * 100) / 100}
          // detectionLimitReachedForMax={measurementData === null ? null : measurementData.detectionLimitReachedForMax}
          // detectionLimitReachedForLatest={measurementData === null ? null : measurementData.detectionLimitReachedForLatest}
          description={""}
          gid={props.feature.properties.loc_id}
          itemKey={plottedProperties.map((elem) => elem.key)}
          intakeIndex={plottedProperties.map((elem) => elem.intakeIndex)}
          feature={props.feature.properties}
        />
      );
      propertiesControls.push(allChems);
    }

    plottedProperties = plottedProperties.filter((item, index) => {
      if (
        searchTerm.length &&
        item.title.toLowerCase().indexOf(searchTermLower) === -1 &&
        item.parameter.toLowerCase().indexOf(searchTermLower) === -1
      ) {
        return false;
      } else {
        return true;
      }
    });

    plottedProperties.map((item, index) => {
      let control = createMeasurementControl(
        item,
        item.key + "_measurement_" + index
      );
      if (control) {
        propertiesControls.push(control);
      }
    });
    setChemicalsList(propertiesControls);
  }, [props.categories, props.feature, searchTerm, openItems]);

  return (
    <Root>
      {/*<ButtonGroup align={Align.Right} spacing={2} marginTop={1}>*/}
      {/*    <Button text={__("Jupiter")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
      {/*    <Button text={__("Borpro")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
      {/*</ButtonGroup>*/}
      <SearchboxContainer>
        <Searchbox
          placeholder={__("Søg efter dataparameter")}
          onChange={(value) => setSearchTerm(value)}
        />
      </SearchboxContainer>
      <ChemicalsList>{chemicalsList}</ChemicalsList>
    </Root>
  );
}

const Root = styled.div`
  background: ${(props) => props.theme.colors.primary[2]};
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  height: 100%;
  width: 100%;
  padding: ${(props) => props.theme.layout.gutter / 2}px;
`;

const SearchboxContainer = styled.div`
  width: 100%;
  //   padding: ${(props) => props.theme.layout.gutter / 2}px 0px;
`;

const ChemicalsList = styled.div`
  width: 100%;
  padding: ${(props) => props.theme.layout.gutter / 4}px;
`;

const ChemicalsListTitle = styled.div`
  color: ${(props) => props.theme.colors.headings};
  margin: 10px 0;
  cursor: pointer;
`;

const mapStateToProps = (state) => ({
  categories: state.global.categories,
  limits: state.global.limits,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChemicalSelector);
