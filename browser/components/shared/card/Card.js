import styled, { css } from "styled-components";
import PropTypes from 'prop-types';
import { Spacing } from '../constants/spacing';

Card.propTypes = {
    spacing: PropTypes.string,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
}

Card.defaultProps = {
    spacing: Spacing.Standard
}

function Card(props) {

    const onClick = (event) => {
        if (props.onClick) {
            props.onClick(event);
        }
    }

    const onMouseEnter = (event) => {
        if (props.onMouseEnter) {
            props.onMouseEnter(event);
        }
    }

    const onMouseLeave = (event) => {
        if (props.onMouseLeave) {
            props.onMouseLeave(event);
        }
    }

    return (
        <Root spacing={props.spacing} hasClick={!!props.onClick} onClick={onClick}
            onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {props.children}
        </Root>
    );
}

const Root = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    width: 100%;
    border: 0;
    box-shadow: none;
    cursor: ${props => props.hasClick ? 'pointer' : 'inherit'};
    &:hover {
        background: ${props => props.hasClick ? props.theme.colors.primary[5] : props.theme.colors.primary[2]};
    }
    ${({ spacing, theme }) => {
        const styles = {
            [Spacing.Standard]: css `
                margin-top: ${props => props.theme.layout.gutter}px;
                padding: ${props => props.theme.layout.gutter/2}px;

            `,
            [Spacing.Lite]: css `
                margin-top: ${props => props.theme.layout.gutter/2}px;
                padding: ${props => props.theme.layout.gutter/4}px;
            `
        }
        return styles[spacing];
    }}
`;

export default Card;
