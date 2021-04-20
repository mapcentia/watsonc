import styled from "styled-components";
import Title from './shared/title/Title';
import CloseButton from './shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from './shared/card/Card';
import IconButton from './shared/button/IconButton';
import CardTitle from './shared/title/CardTitle';
import CheckBoxList from './shared/list/CheckBoxList';
import { hexToRgbA } from '../helpers/colors';

const CheckBoxGroups = [
    {
        title: __('Grundvand'),
        listItems: [__('Jupiter boringer'), __('Jupiter anlaeg'), __('Online stationer')]
    },
    {
        title: __('Overfladevand'),
        listItems: [__('Vandleb'), __('Hav')]
    }

]

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
                <Grid container>
                    <Grid container item md={6}>
                        <Card>
                            <CardTitle text={__('Datakilder')} />
                            {CheckBoxGroups.map((group) => {
                                return <CheckBoxList title={group.title} listItems={group.listItems} />
                            })}
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
