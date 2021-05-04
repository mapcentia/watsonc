import styled, { css } from "styled-components";
import PropTypes from 'prop-types';
import { Spacing } from '../constants/spacing';

function Card(props) {
    return (
        <Root spacing={props.spacing}>
            {props.children}
        </Root>
    );
}

Card.propTypes = {
    spacing: PropTypes.string
}

Card.defaultProps = {
    spacing: Spacing.Standard
}

const Root = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    width: 100%;
    border: 0;
    box-shadow: none;
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
