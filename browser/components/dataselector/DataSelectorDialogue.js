import { useState, useEffect } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { selectChemical } from "../../redux/actions";
import Title from "../shared/title/Title";
import CloseButton from "../shared/button/CloseButton";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Card from "../shared/card/Card";
import CheckBoxList from "../shared/list/CheckBoxList";
import RadioButtonList from "../shared/list/RadioButtonList";
import Button from "../shared/button/Button";
import ButtonGroup from "../shared/button/ButtonGroup";
import ProjectList from "./ProjectList";
import PredefinedDatasourceViews from "./PredefinedDatasourceViews";
import { Variants } from "../shared/constants/variants";
import { Size } from "../shared/constants/size";
import { Align } from "../shared/constants/align";
import { hexToRgbA } from "../../helpers/colors";
import { WATER_LEVEL_KEY } from "../../constants";
import { DarkTheme } from "../../themes/DarkTheme";
import MetaApi from "../../api/meta/MetaApi";
import Searchbox from "../shared/inputs/Searchbox";
import { showSubscription } from "../../helpers/show_subscriptionDialogue";

DataSelectorDialogue.propTypes = {
  text: PropTypes.string,
  state: PropTypes.object,
  categories: PropTypes.object,
  onApply: PropTypes.func,
};

const session = require("./../../../../session/browser/index");

function DataSelectorDialogue(props) {
  const [allParameters, setAllParameters] = useState([]);
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState();
  const [dataSources, setDataSources] = useState([]);
  const [parameterSearchTerm, setParameterSearchTerm] = useState("");
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const waterLevelParameter = {
      label: __("Vandstand"),
      value: WATER_LEVEL_KEY,
      group: __("Vandstand"),
    };
    let chemicals = [waterLevelParameter];
    for (let key in props.categories[LAYER_NAMES[0]]) {
      if (key == "Vandstand") {
        continue;
      }
      for (let key2 in props.categories[LAYER_NAMES[0]][key]) {
        var label = props.categories[LAYER_NAMES[0]][key][key2];
        chemicals.push({ label: label, value: key2, group: key });
      }
    }
    setAllParameters([...chemicals]);
    setSelectedParameter(waterLevelParameter);
  }, [props.categories]);

  const onChemicalSelect = (param) => {
    setSelectedParameter(param);
    props.selectChemical(param.value);
  };

  const loadDataSources = () => {
    const api = new MetaApi();
    api.getMetaData("calypso_stationer").then((response) => {
      setDataSources(response);
    });
  };
  const applyLayer = (layer, chem = false) => {
    props.onApply({
      layers: [layer],
      chemical: chem,
      filters: filter,
    });
    props.onCloseButtonClick();
  };

  useEffect(() => {
    loadDataSources();
  }, []);

  useEffect(() => {
    $.ajax({
      url: `/api/sql/watsonc?q=SELECT loc_id, locname, groupname, relation FROM calypso_stationer.calypso_my_stations_v2 WHERE user_id in (${
        session.getProperties()?.organisation.id
      }, ${session.getUserName()}) &base64=false&lifetime=60&srs=4326`,
      method: "GET",
      dataType: "json",
    }).then((response) => {
      var features = response.features;
      var myStations = [];

      features.forEach((element) => {
        myStations = myStations.concat(element.properties.loc_id);
      });

      let filter = {
        match: "any",
        columns: [
          {
            fieldname: "loc_id",
            expression: "=",
            value: "ANY( ARRAY[" + myStations.join(", ") + "])",
            restriction: false,
          },
        ],
      };

      let filters = { "calypso_stationer.all_stations": filter };
      setFilter(filters);
    });
  }, []);

  useEffect(() => {
    const params = allParameters.filter((parameter) => {
      return (
        parameterSearchTerm.length == 0 ||
        parameter.label
          .toLowerCase()
          .indexOf(parameterSearchTerm.toLowerCase()) > -1
      );
    });
    setParameters(params);
  }, [parameterSearchTerm, allParameters]);

  const applyParameter = () => {
    const layers = selectedDataSources.map((source) => {
      return source.value;
    });

    props.onApply({
      layers: layers,
      chemical: selectedParameter ? selectedParameter.value : false,
      filters: filter,
    });
    props.onCloseButtonClick();
  };

  return (
    <Root>
      <ModalHeader>
        <Grid container>
          <Grid container item xs={10}>
            <Title text={props.titleText} color={DarkTheme.colors.headings} />
          </Grid>
          <Grid container justify="flex-end" item xs={2}>
            <CloseButton onClick={props.onCloseButtonClick} />
          </Grid>
        </Grid>
      </ModalHeader>
      <ModalBody>
        {showProjectsList ? (
          <ProjectList
            onStateSnapshotApply={props.onCloseButtonClick}
            {...props}
          />
        ) : (
          <div>
            <div>
              <Title text={__("Quick Access")} level={3} />
              <PredefinedDatasourceViews
                applyLayer={applyLayer}
                setSelectedDataSources={setSelectedDataSources}
                setSelectedParameter={setSelectedParameter}
              />
            </div>
            <GridContainer>
              <Grid container spacing={32}>
                <Grid container item md={6}>
                  <Card>
                    <Title text={__("Datakilder")} level={3} />
                    <CheckBoxList
                      listItems={dataSources}
                      onChange={setSelectedDataSources}
                      selectedItems={selectedDataSources}
                    />
                  </Card>
                </Grid>
                <Grid container item md={6}>
                  {selectedDataSources.findIndex(
                    (item) => item.value == "v:system.all"
                  ) > -1 ? (
                    <Card>
                      <Searchbox
                        value={parameterSearchTerm}
                        placeholder={__("Søg efter måleparameter")}
                        onChange={(value) => setParameterSearchTerm(value)}
                      />
                      <RadioButtonList
                        listItems={parameters}
                        onChange={onChemicalSelect}
                        selectedParameter={selectedParameter}
                      />
                    </Card>
                  ) : null}
                </Grid>
              </Grid>
            </GridContainer>
          </div>
        )}
        {showProjectsList ? (
          <ButtonGroup align={Align.Center}>
            <Button
              text={__("Vælg datakilder og lag")}
              variant={Variants.None}
              onClick={() => setShowProjectsList(false)}
              size={Size.Large}
            />
          </ButtonGroup>
        ) : (
          <ButtonGroup align={Align.Center} spacing={2}>
            <Button
              text={__("Abn eksisterende dashboard")}
              variant={Variants.None}
              onClick={() => {
                if (session.getProperties()["license"] === "free") {
                  showSubscription();
                  return;
                }
                setShowProjectsList(!showProjectsList);
              }}
              size={Size.Large}
            />
            <Button
              text={__("Start")}
              variant={
                selectedDataSources.length === 0
                  ? Variants.PrimaryDisabled
                  : Variants.Primary
              }
              onClick={() => applyParameter()}
              size={Size.Large}
              disabled={selectedDataSources.length === 0}
            />
          </ButtonGroup>
        )}
      </ModalBody>
    </Root>
  );
}

const Root = styled.div`
  background: ${({ theme }) => hexToRgbA(theme.colors.primary[1], 1)};
  border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
  color: ${({ theme }) => `${theme.colors.headings}`};
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) =>
    `${theme.layout.gutter}px ${theme.layout.gutter}px 0 ${theme.layout.gutter}px`};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => `${theme.layout.gutter}px`};
`;

const GridContainer = styled.div`
  padding-top: ${(props) => props.theme.layout.gutter / 4}px;
`;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  selectChemical: (key) => dispatch(selectChemical(key)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSelectorDialogue);
