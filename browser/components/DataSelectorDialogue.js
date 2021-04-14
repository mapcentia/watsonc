import styled from "styled-components";
import Title from './shared/title/Title';
import CloseButton from './shared/button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

function DataSelectorDialogue(props) {
    return (
        <Root>
            <div>
                <Grid container>
                    <Grid container item xs={10}>
                        <Title text={props.titleText} />
                    </Grid>
                    <Grid container justify="flex-end" item xs={2}>
                        <CloseButton onClick={props.onCloseButtonClick} />
                    </Grid>
                </Grid>
            </div>
            <div className="modal-body">
                {props.children}
            </div>
        </Root>
    );
}
DataSelectorDialogue.propTypes = {
    text: PropTypes.string,
}

const Root = styled.div`
    background: ${({ theme }) => theme.colors.primary[1]};
    padding: 24px;
    border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
`
export default DataSelectorDialogue;
