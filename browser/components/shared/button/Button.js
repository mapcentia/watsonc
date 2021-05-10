import styled, { css } from "styled-components";
import { Variants } from "../constants/variants";
import { Size } from '../constants/size';
import PropTypes from 'prop-types';

Button.propTypes = {
    text: PropTypes.string,
    variant: PropTypes.oneOf(Object.keys(Variants)),
    size: PropTypes.oneOf(Object.keys(Size)),
    onClick: PropTypes.func.isRequired
}

function Button(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}
            variant={props.variant}
            disabled={props.disabled ? props.disabled : false}
            size={props.size}>
            {props.text}
        </Root>
    );
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
  ${({ size, theme }) => {
        const styles = {
            [Size.Small]: css `
                width: ${theme.layout.gutter * 2}px;
            `,
            [Size.Medium]: css `
                width: ${theme.layout.gutter * 5}px;
            `,
            [Size.Large]: css `
                width: ${theme.layout.gutter * 10}px;
            `
        };
        return styles[size];
  }}
`
export default Button;
