import styled, { css } from "styled-components";
import PropTypes from 'prop-types';
import Icon from '../icons/Icon';

IconButton.propTypes = {
    onClick: PropTypes.func,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
}

function IconButton(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}>
            <Icon name={props.icon} size={32} />
            <IconLabel>{props.label}</IconLabel>
        </Root>
    )
}

const Root = styled.button`
    height: 80px;
    width: 80px;
    background: ${props => props.theme.colors.primary[1]};
    border 2px solid ${props => props.theme.colors.primary[3]};
    color: ${props => props.theme.colors.gray[4]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    margin-right: ${props => props.theme.layout.gutter/2}px;
    &:hover {
        border: 2px solid ${props => props.theme.colors.interaction[4]};
    }
`;

const IconLabel = styled.div`
    font: ${props => props.theme.fonts.footnote};
    color: ${props => props.theme.colors.gray[4]};
`;

export default IconButton;
