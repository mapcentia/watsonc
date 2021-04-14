import styled from "styled-components";
import PropTypes from 'prop-types';

function Title(props) {
    return (
        <Root>
            {props.text}
        </Root>
    );
}
Button.propTypes = {
    text: PropTypes.string,
}

const Root = styled.h4`
    font-size: 40px;
    color: ${props => props.theme.colors.dialogueTitle};
    font-family: ${props => props.theme.fonts.title};
`
export default Title;
