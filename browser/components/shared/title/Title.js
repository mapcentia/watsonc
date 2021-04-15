import styled from "styled-components";
import PropTypes from 'prop-types';

function Title(props) {
    return (
        <Root>
            {props.text}
        </Root>
    );
}
Title.propTypes = {
    text: PropTypes.string,
}

const Root = styled.h4`
    color: ${props => props.theme.colors.headings};
    font: ${props => props.theme.fonts.title};
`
export default Title;
