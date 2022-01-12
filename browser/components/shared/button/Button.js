import styled, { css } from "styled-components";
import { Variants } from "../constants/variants";
import { Size } from "../constants/size";
import PropTypes from "prop-types";

Button.propTypes = {
  text: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(Variants)),
  size: PropTypes.oneOf(Object.keys(Size)),
  onClick: PropTypes.func.isRequired,
};

function Button(props) {
  const onClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
  };
  return (
    <Root
      onClick={onClick}
      variant={props.variant}
      disabled={props.disabled ? props.disabled : false}
      size={props.size}
    >
      {props.text}
    </Root>
  );
}

const Root = styled.button`
  padding: 0 24px 0 24px;
  font-size: 16px;
  cursor: pointer;
  border: 0;
  font: ${(props) => props.theme.fonts.body};
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  color: black;
  ${({ variant, theme }) => {
    const styles = {
      [Variants.Primary]: css`
        background-color: ${theme.colors.interaction[4]};
        &:hover {
          background-color: ${(props) => props.theme.colors.interaction[5]};
        }
      `,
      [Variants.Secondary]: css`
        background-color: ${theme.colors.primary[3]};
        color: ${theme.colors.headings};
      `,
      [Variants.None]: css`
        background-color: ${theme.colors.gray[4]};
      `,
      [Variants.Transparent]: css`
        background-color: transparent;
        border: 1px solid ${(props) => props.theme.colors.headings};
        color: ${(props) => props.theme.colors.headings};
      `,
    };
    return styles[variant];
  }}
  ${({ size, theme }) => {
    const styles = {
      [Size.Small]: css`
        width: ${theme.layout.gutter * 3}px;
        font: ${theme.fonts.label};
        min-height: 24px;
      `,
      [Size.Medium]: css`
        width: ${theme.layout.gutter * 5}px;
        min-height: 24px;
        font: ${theme.fonts.label};
      `,
      [Size.Large]: css`
        width: ${theme.layout.gutter * 10}px;
      `,
    };
    return styles[size];
  }}
`;
export default Button;
