import styled, { css } from "styled-components";
import { Variants } from "../../../constants";
import PropTypes from 'prop-types';

function Button(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}
            variant={props.variant}>
            {props.text}
        </Root>
    );
}
Button.propTypes = {
    text: PropTypes.string,
    variant: PropTypes.oneOf(Object.keys(Variants)),
    onClick: PropTypes.func.isRequired
}

const Root = styled.button`
    height: 40px;
    padding: 0 24px 0 24px;
    font-size: 16px;
    cursor: pointer;
    border: 0;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    color: black;
    margin: 0 10px 0 10px;
    ${({ variant, theme }) => {
        const styles = {
            [Variants.Primary]: css `
                background-color: ${theme.colors.interaction[4]};
                &:hover {
                    background-color: ${props => props.theme.colors.interaction[5]};
                }
            `,
            [Variants.Secondary]: css `
                background-color: ${theme.colors.primary[4]};
            `,
            [Variants.None]: css `
                background-color: ${theme.colors.gray[3]};
            `
        };
        return styles[variant];
  }}
`
export default Button;
