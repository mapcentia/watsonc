import styled from "styled-components";
import PropTypes from 'prop-types';

function CardTitle(props) {
    return (
        <Root>
            {props.text}
        </Root>
    );
}
CardTitle.propTypes = {
    text: PropTypes.string,
}

const Root = styled.h4`
    color: ${props => props.theme.colors.gray[3]};
    font: ${props => props.theme.fonts.heading};
`
export default CardTitle;
