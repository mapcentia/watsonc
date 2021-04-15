import styled from "styled-components";
import Title from './shared/title/Title';
import CloseButton from './shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import IconButton from './shared/button/IconButton';

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
                <IconButton icon="dashboard" label="Science" />
                <IconButton icon="lock" label="Lock" />
                <IconButton icon="history" label="History" />
            </ModalBody>
        </Root>
    );
}
DataSelectorDialogue.propTypes = {
    text: PropTypes.string,
}

const Root = styled.div`
    background: ${({ theme }) => theme.colors.primary[1]};
    border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
`;

const ModalHeader = styled.div`
    padding: ${( { theme }) => `${theme.layout.gutter}px 0 0 ${theme.layout.gutter}px`};
`;

const ModalBody = styled.div`
    padding: ${( { theme }) => `${theme.layout.gutter}px`};
`;
export default DataSelectorDialogue;
