import styled, { css } from "styled-components";
import { Variants } from "../../../constants";
import PropTypes from 'prop-types';
import Icon from "@material-ui/core/Icon";

function CloseButton(props) {
    return (
        <Root
            onClick={props.onClick ?? props.onClick}
            variant={props.variant}>
            X
        </Root>
    );
}
CloseButton.propTypes = {
    text: PropTypes.string,
    onClick: PropTypes.func.isRequired
}

const Root = styled.button`
    font-size: 8px;
    height: 16px;
    margin-top: 16px;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.dialogueTitle};
    border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
    color: ${({ theme }) => theme.colors.dialogueTitle};
    background: transparent;
`
export default CloseButton;
