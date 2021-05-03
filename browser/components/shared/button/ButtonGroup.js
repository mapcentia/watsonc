import styled, { css } from "styled-components";
import { Align } from '../constants/align';
import PropTypes from 'prop-types';

function ButtonGroup(props) {
    return (
        <Root align={props.align}>
            {props.children}
        </Root>
    );
}
ButtonGroup.propTypes = {
    text: PropTypes.string,
    align: PropTypes.string,
}

const Root = styled.div`
    display: flex;
    margin-top: ${props => props.theme.layout.gutter}px;
    ${({ align, theme }) => {
        const styles = {
            [Align.LEFT]: css `
                justify-content: start;
                align-items: flex-start;
                button {
                    margin-right: ${theme.layout.gutter / 2}px;
                }
            `,
            [Align.CENTER]: css`
                justify-content: center;
                align-items: center;
                button {
                  margin-left: ${theme.layout.gutter / 2};
                  margin-right: ${theme.layout.gutter / 2};
                }
            `,
            [Align.RIGHT]: css`
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
