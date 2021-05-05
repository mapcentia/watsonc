import { useState } from 'react';
import styled from "styled-components";
import Title from './shared/title/Title';
import CloseButton from './shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from './shared/card/Card';
import IconButton from './shared/button/IconButton';
import CheckBoxList from './shared/list/CheckBoxList';
import RadioButtonList from './shared/list/RadioButtonList';
import Button from './shared/button/Button';
import ButtonGroup from './shared/button/ButtonGroup';
import ProjectList from './ProjectList';
import { Variants } from './shared/constants/variants';
import { Size } from './shared/constants/size';
import { Align } from './shared/constants/align';
import { hexToRgbA } from '../helpers/colors';

const DataSources = [{ label: "Klima", value: "klima", group: "Klima"},
	{ label: "Hav", value: "hav", group: "Overfladevand"},
	{ label: "Sø", value: "sø", group: "Overfladevand"},
	{ label: "Fjord, hav mm.", value: "fjord", group: "Overfladevand"},
	{ label: "Grundvand, boringer", value: "grundvandsboringer", group: "Grundvand"},
	{ label: "Grundvand, moser, kær mm.", value: "grundvand", group: "Grundvand"}]

const Parameters = [
	{ label: "Vandstand", value: "vandstand", group: "Vandstand"},
	{ label: "Lugt", value: "lugt", group: "Tilstandsparametre"},
	{ label: "Smag", value: "smag", group: "Tilstandsparametre"},
	{ label: "Konduktivitet", value: "konduktivitet", group: "Tilstandsparametre"},
	{ label: "pH", value: "ph", group: "Tilstandsparametre"},
	{ label: "Turbiditet", value: "turbiditet", group: "Tilstandsparametre"},
	{ label: "Farvetal-Pt", value: "farvatel-pt", group: "Tilstandsparametre"},
	{ label: "Hardhed, total", value: "hardhedtotal", group: "Tilstandsparametre"},
	{ label: "Temperatur", value: "temperatur", group: "Tilstandsparametre"},
    { label: "Oxygen indhold", value: "oxygenindhold", group: "Kemiske hovedbestanddele"},
    { label: "Carbondioxid, aggr.", value: "carbondioxid", group: "Kemiske hovedbestanddele"},
]

DataSelectorDialogue.propTypes = {
    text: PropTypes.string,
    state: PropTypes.object,
}

function DataSelectorDialogue(props) {
    const [showProjectsList, setShowProjectsList] = useState(false);
    console.log(props);
    return (
        <Root>
            <ModalHeader>
                <Grid container>
                    <Grid container item xs={10}>
                        <Title text={props.titleText} />
                    </Grid>
                    <Grid container justify="flex-end" item xs={2}>
                        <CloseButton onClick={props.onCloseButtonClick} />
                    </Grid>
                </Grid>
            </ModalHeader>
            <ModalBody>
                {showProjectsList ? <ProjectList onStateSnapshotApply={props.onCloseButtonClick} state={props.state} /> :
                    <div>
                        <IconButton icon="cleaning-spray" label={__('Pesticider')} />
                        <IconButton icon="no3-solid" label={__('Nitrat')} />
                        <IconButton icon="water-drop-wifi-solid" label={__('Mine stationer')} />
                        <IconButton icon="lab-flask-experiment" label={__('Mine favoritter')} />

                        <Grid container spacing={32}>
                            <Grid container item md={6}>
                                <Card>
                                    <Title text={__('Datakilder')} level={3} />
                                    <CheckBoxList listItems={DataSources} onChange={(selectedItems) => console.log(selectedItems)} />
                                </Card>
                            </Grid>
                            <Grid container item md={6}>
                                <Card>
                                    <Title text={__('Måleparameter')} level={3} />
                                    <RadioButtonList listItems={Parameters} onChange={(selectedItem) => console.log(selectedItem)} />
                                </Card>
                            </Grid>
                        </Grid>
                    </div>}
                {showProjectsList ? <ButtonGroup align={Align.Center}>
                    <Button text={__("Choose datasource and layers")} variant={Variants.None} onClick={() => setShowProjectsList(false)} size={Size.Large} />

                </ButtonGroup> :
                <ButtonGroup align={Align.Center}>
                    <Button text={__("Abn eksisterende")} variant={Variants.None} onClick={() => setShowProjectsList(!showProjectsList)} size={Size.Large} />
                    <Button text={__("Start")} variant={Variants.Primary} onClick={() => console.log("Button click star")} size={Size.Large} />
                </ButtonGroup> }
            </ModalBody>
        </Root>
    );
}

const Root = styled.div`
    background: ${({ theme }) => hexToRgbA(theme.colors.primary[1], 0.92)};
    border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
`;

const ModalHeader = styled.div`
    padding: ${( { theme }) => `${theme.layout.gutter}px ${theme.layout.gutter}px 0 ${theme.layout.gutter}px`};
`;

const ModalBody = styled.div`
    padding: ${( { theme }) => `${theme.layout.gutter}px`};
`;

export default DataSelectorDialogue;
