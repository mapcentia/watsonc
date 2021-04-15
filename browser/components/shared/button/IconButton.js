import styled, { css } from "styled-components";
import PropTypes from 'prop-types';
import Icon from "@material-ui/core/Icon";


function IconButton(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}>
            <Icon fontSize="large">{props.icon}</Icon>
            <IconLabel>{props.label}</IconLabel>
        </Root>
    )
}

IconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
}

const Root = styled.button`
    height: 80px;
    width: 80px;
    background: transparent;
    border 1px solid ${props => props.theme.colors.primary[3]};
    color: ${props => props.theme.colors.gray[4]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    margin-right: 16px;
`;

const IconLabel = styled.div`
    font: ${props => props.theme.fonts.footnote};
    color: ${props => props.theme.colors.gray[4]};
`;

export default IconButton;
