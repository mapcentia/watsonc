import styled from "styled-components";
import Title from './shared/title/Title';
import CloseButton from './shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from './shared/card/Card';
import IconButton from './shared/button/IconButton';
import CardTitle from './shared/title/CardTitle';
import CheckBoxList from './shared/list/CheckBoxList';
import RadioButtonList from './shared/list/RadioButtonList';
import { hexToRgbA } from '../helpers/colors';

const DataSources = [{ label: "Klima", value: "klima", group: "Klima"},
	{ label: "Hav", value: "hav", group: "Overfladevand"},
	{ label: "Sø", value: "sø", group: "Overfladevand"},
	{ label: "Fjord, hav mm.", value: "fjord", group: "Overfladevand"},
	{ label: "Grundvand, boringer", value: "grundvandsboringer", group: "Grundvand"},
	{ label: "Grundvand, moser, kær mm.", value: "grundvand", group: "Grundvand"}]


function DataSelectorDialogue(props) {
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
                <IconButton icon="cleaning-spray" label={__('Pesticider')} />
                <IconButton icon="no3-solid" label={__('Nitrat')} />
                <IconButton icon="water-drop-wifi-solid" label={__('Mine stationer')} />
                <IconButton icon="lab-flask-experiment" label={__('Mine favoritter')} />
                <Grid container spacing={32}>
                    <Grid container item md={6}>
                        <Card>
                            <CardTitle text={__('Datakilder')} />
                            <CheckBoxList listItems={DataSources} onChange={(selectedItems) => console.log(selectedItems)} />
                        </Card>
                    </Grid>
                    <Grid container item md={6}>
                        <Card>
                            <CardTitle text={__('Datakilder')} />
                            <RadioButtonList listItems={DataSources} onChange={(selectedItem) => console.log(selectedItem)} />
                        </Card>
                    </Grid>
                </Grid>
            </ModalBody>
        </Root>
    );
}
DataSelectorDialogue.propTypes = {
    text: PropTypes.string,
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
