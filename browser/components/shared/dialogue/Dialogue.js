import styled from "styled-components";
import Title from '../title/Title';
import PropTypes from 'prop-types';

function Dialogue(props) {
    return (
        <Root>
            <div className="modal-header">
                <Title text={props.titleText} />
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
    background: ${({ theme }) => theme.colors.background};
`
export default Dialogue;
