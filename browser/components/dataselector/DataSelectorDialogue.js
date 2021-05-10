import { useState, useEffect } from 'react';
import styled from "styled-components";
import Title from '../shared/title/Title';
import CloseButton from '../shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from '../shared/card/Card';
import CheckBoxList from '../shared/list/CheckBoxList';
import RadioButtonList from '../shared/list/RadioButtonList';
import Button from '../shared/button/Button';
import ButtonGroup from '../shared/button/ButtonGroup';
import ProjectList from './ProjectList';
import PredefinedDatasourceViews from './PredefinedDatasourceViews';
import { Variants } from '../shared/constants/variants';
import { Size } from '../shared/constants/size';
import { Align } from '../shared/constants/align';
import { hexToRgbA } from '../../helpers/colors';
import {WATER_LEVEL_KEY} from '../../constants';

const DataSources = [{ label: "Klima", value: "klima", group: "Klima"},
	{ label: "Hav", value: "hav", group: "Overfladevand"},
	{ label: "Sø", value: "sø", group: "Overfladevand"},
	{ label: "Fjord, hav mm.", value: "fjord", group: "Overfladevand"},
	{ label: "Grundvand, boringer", value: "grundvandsboringer", group: "Grundvand"},
	{ label: "Grundvand, moser, kær mm.", value: "grundvand", group: "Grundvand"}]

DataSelectorDialogue.propTypes = {
    text: PropTypes.string,
    state: PropTypes.object,
    categories: PropTypes.object,
}

function DataSelectorDialogue(props) {
    const [showProjectsList, setShowProjectsList] = useState(false);
    const [parameters, setParameters] = useState([]);
    const [selectedDataSources, setSelectedDataSources] = useState([]);
    const [selectedParameter, setSelectedParameter] = useState();

    useEffect(() => {
        let chemicals = [{label: __('Water Level'), value: WATER_LEVEL_KEY, group: __('Water Level')}];
        for (let key in props.categories[LAYER_NAMES[0]]) {
            if (key == 'Vandstand') {
                continue;
            }
            for (let key2 in props.categories[LAYER_NAMES[0]][key]) {
                var label = props.categories[LAYER_NAMES[0]][key][key2];
                chemicals.push({'label': label, 'value': label, 'group': key});
            }
        }
        setParameters(chemicals);
    }, [props.categories]);
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
                {showProjectsList ? <ProjectList onStateSnapshotApply={props.onCloseButtonClick} {...props} /> :
                    <div>
                        <PredefinedDatasourceViews />
                        <Grid container spacing={32}>
                            <Grid container item md={6}>
                                <Card>
                                    <Title text={__('Datakilder')} level={3} />
                                    <CheckBoxList listItems={DataSources} onChange={setSelectedDataSources} />
                                </Card>
                            </Grid>
                            <Grid container item md={6}>
                                <Card>
                                    <Title text={__('Måleparameter')} level={3} />
                                    <RadioButtonList listItems={parameters} onChange={setSelectedParameter} />
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
