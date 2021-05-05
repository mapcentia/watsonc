import * as React from "react";
import styled, { css } from "styled-components";
import { Variants } from "../constants/variants";
import icons from "../../../../shared/icons/icons.json";
import { IconName } from "../../../../shared/icons/icons";
import PropTypes from 'prop-types';

Icon.propTypes = {
    name: PropTypes.string,
    variant: PropTypes.oneOf(Object.keys(Variants)),
    onClick: PropTypes.func,
    strokeColor: PropTypes.string,
    fillColor: PropTypes.string,
    marginRight: PropTypes.number,
    size: PropTypes.number
}

Icon.defaultProps = {
    strokeColor: 'currentColor',
    fillColor: 'none',
    size: 24,
    variant: 'Primary',
    marginRight: 0
}

function Icon(props) {
  const icon = icons.find((i) => i.name === props.name);
  if (!icon) {
    // tslint:disable-next-line:no-console
    console.warn(`Unable to find icon with name "${name}"`);
    return null;
  }
  var size = props.size;
  var viewBox = icon.viewbox || '0 0 24 24';
  return (
    <Root
      onClick={props.onClick ?? props.onClick}
      style={{ width: size, height: size }}
      marginRight={props.marginRight}
    >
      <svg
        version="1.1"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={size}
        height={size}
      >
        {icon.name.endsWith("-solid") ? (
          <g fill={props.strokeColor}>
            <path d={icon.path} />
          </g>
        ) : (
          <g
            strokeLinecap="round"
            strokeWidth="1.5"
            stroke={props.strokeColor}
            fill={props.fillColor}
            strokeLinejoin="round"
          >
            <path d={icon.path} />
          </g>
        )}
      </svg>
    </Root>
  );

}

const Root = styled.div`
  display: inline-block;
  position: relative;
  margin-right: ${props => props.marginRight}px;
  ${({ variant, theme }) => {
    const styles = {
        [Variants.Primary]: css `
            background-color: ${theme.colors.gray[4]};
            &:hover {
                background-color: ${props => props.theme.colors.gray[5]};
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
`;

export default Icon
