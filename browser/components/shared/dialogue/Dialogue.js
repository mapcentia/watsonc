import styled from "styled-components";
import Title from '../title/Title';
import CloseButton from '../button/CloseButton';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

function Dialogue(props) {
    return (
        <Root>
            <div className="modal-header">
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
Button.propTypes = {
    text: PropTypes.string,
}

const Root = styled.div`
    background: ${({ theme }) => theme.colors.primary[1]};
    padding: 24px 32px 24px 32px;
    border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
`
export default Dialogue;
