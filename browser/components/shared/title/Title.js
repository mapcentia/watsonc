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
    font-size: 34px;
    color: ${props => props.theme.colors.headings};
    text-align: center;
    font-weight: bold;
`
export default Title;
