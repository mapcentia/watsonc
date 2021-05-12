import styled, { css } from "styled-components";
import { Align } from '../constants/align';
import PropTypes from 'prop-types';

ButtonGroup.propTypes = {
    text: PropTypes.string,
    align: PropTypes.string,
}

function ButtonGroup(props) {
    return (
        <Root align={props.align} marginTop={props.marginTop}>
            {props.children}
        </Root>
    );
}

const Root = styled.div`
    display: flex;
    margin-top: ${props => props.marginTop || props.theme.layout.gutter}px;
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
                button {
                  margin-left: ${theme.layout.gutter / 2};
                  margin-right: ${theme.layout.gutter / 2};
                }
            `,
            [Align.Right]: css`
                justify-content: flex-end,
                align-items: flex-end,
                button {
                    marginLeft: ${theme.layout.gutter / 2}px;
                }
            `
        }
        return styles[align];
    }}
`
export default ButtonGroup;
