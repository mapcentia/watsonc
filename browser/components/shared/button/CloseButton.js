import styled, { css } from "styled-components";
import { Variants } from "../../../constants";
import PropTypes from 'prop-types';
import Icon from "@material-ui/core/Icon";

CloseButton.propTypes = {
    text: PropTypes.string,
    onClick: PropTypes.func.isRequired
}

function CloseButton(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}
            variant={props.variant}>
              <svg xmlns="http://www.w3.org/2000/svg" width="11.025" height="11.025" viewBox="0 0 11.025 11.025">
                <g id="icon-close" transform="translate(5.722 -3.889) rotate(45)">
                  <line id="Line_2232" data-name="Line 2232" x2="13" transform="translate(0 6.796)" fill="none" stroke="#b4afaf" strokeWidth="2"/>
                  <line id="Line_2233" data-name="Line 2233" x2="13.592" transform="translate(6.5) rotate(90)" fill="none" stroke="#b4afaf" strokeWidth="2"/>
                </g>
              </svg>
        </Root>
    );
}

const Root = styled.button`
    height: 20px;
    width: 20px;
    margin-top: 16px;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.headings};
    border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
    color: ${({ theme }) => theme.colors.headings};
    background: transparent;
    padding: 0;
`
export default CloseButton;
