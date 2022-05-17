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

ChemicalSelectorModal.propTypes = {
  text: PropTypes.string,
  state: PropTypes.object,
  categories: PropTypes.object,
  onApply: PropTypes.func,
};

function ChemicalSelectorModal(props) {
  const [allParameters, setAllParameters] = useState([
    // {
    //   label: __("Vandstand"),
    //   value: WATER_LEVEL_KEY,
    //   group: __("Vandstand"),
    // },
  ]);
  const [parameters, setParameters] = useState([
    // {
    //   label: __("Vandstand"),
    //   value: WATER_LEVEL_KEY,
    //   group: __("Vandstand"),
    // },
  ]);
  const [parameterSearchTerm, setParameterSearchTerm] = useState("");
  const [selectedParameter, setSelectedParameter] = useState({
    label: __("Vandstand"),
    value: WATER_LEVEL_KEY,
    group: __("Vandstand"),
  });

  useEffect(() => {
    const notSelected = {
      label: __("Ikke valgt"),
      value: false,
      group: __("Ikke valgt"),
    };
    let chemicals = [notSelected];
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
    setSelectedParameter(notSelected);
  }, [props.categories]);

  const onChemicalSelect = (param) => {
    setSelectedParameter(param);
    props.selectChemical(param.value);
  };

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
    props.onCloseButtonClick ? props.onCloseButtonClick() : null;
  };

  return (
    <Root>
      <ModalHeader>
        <Grid container>
          <Grid container item xs={10}>
            <Title
              text={__("Vælg datakilde")}
              color={DarkTheme.colors.headings}
            />
          </Grid>
          <Grid container justify="flex-end" item xs={2}>
            <CloseButton
              onClick={() => $("#watsonc-select-chemical-dialog").modal("hide")}
            />
          </Grid>
        </Grid>
      </ModalHeader>
      <ModalBody>
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
        <ButtonGroup align={Align.Center}>
          <Button
            text={__("Start")}
            variant={Variants.Primary}
            onClick={() => {
              props.onClickControl(selectedParameter.value);
            }}
            size={Size.Large}
          />
        </ButtonGroup>
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
  padding-top: ${(props) => props.theme.layout.gutter / 2}px;
`;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  selectChemical: (key) => dispatch(selectChemical(key)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChemicalSelectorModal);
