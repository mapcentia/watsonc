import styled, { css } from "styled-components";
import { Align } from '../constants/align';
import PropTypes from 'prop-types';

ButtonGroup.propTypes = {
    text: PropTypes.string,
    align: PropTypes.string,
    marginTop: PropTypes.number,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,
    spacing: PropTypes.number,
}

function ButtonGroup(props) {
    return (
        <Root align={props.align} marginTop={props.marginTop} marginLeft={props.marginLeft} marginRight={props.marginRight} spacing={props.spacing}>
            {props.children}
        </Root>
    );
}

const Root = styled.div`
    display: flex;
    margin-top: ${props => props.marginTop || props.theme.layout.gutter}px;
    margin-right: ${props => props.marginRight || 0}px;
    margin-left: ${props => props.marginLeft || 0}px;
    ${({ align, theme }) => {
        const styles = {
            [Align.Left]: css `
                justify-content: start;
                align-items: flex-start;
                button {
                    margin-right: ${theme.layout.gutter / 2}px;
                }
            `,
            [Align.Center]: css`
                justify-content: center;
                align-items: center;
            `,
            [Align.Right]: css`
                justify-content: flex-end,
                align-items: flex-end,
                button {
                    margin-left: ${theme.layout.gutter / 2}px;
                }
            `
        }
        return styles[align];
    }}

    button + button {
        margin-left: ${props => props.spacing*8}px;
    }
`
export default ButtonGroup;
