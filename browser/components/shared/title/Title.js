import styled, { css } from "styled-components";
import PropTypes from 'prop-types';

function Title(props) {
    return (
        <Root level={props.level}>
            {props.text}
        </Root>
    );
}
Title.propTypes = {
    text: PropTypes.string.isRequired,
    level: PropTypes.number,
    className: PropTypes.string,
    align: PropTypes.string,
}

Title.defaultProps = {
    level: 1,
    align: 'left'

}

const Root = styled.h4`
    display: "block",
    fontWeight: "normal",
    margin: 0,
    lineHeight: 1.3
    text-align: ${props => props.align};
    ${({ level, theme }) => {
        const styles = {

            1: css `
                font: ${props => props.theme.fonts.title};
                color: ${props => props.theme.colors.headings};
            `,
            2: css `
                font: ${props => props.theme.fonts.subtitle};
            `,
            3: css `
                font: ${props => props.theme.fonts.heading};
                color: ${props => props.theme.colors.gray[3]};
            `,
            4: css `
                font: ${props => props.theme.fonts.body};
            `,
            5: css `
                margin-top: ${props => props.theme.layout.gutter/2}px;
                font: ${props => props.theme.fonts.subbody};
                color: ${props => props.theme.colors.gray[4]};
            `,
            6: css `
                margin-top: ${props => props.theme.layout.gutter/4}px;
                font: ${props => props.theme.fonts.label};
                color: ${props => props.theme.colors.gray[5]};
            `,
            7: css `
                font: ${props => props.theme.fonts.footnote};
            `,
        }
        return styles[level];
    }}
`
export default Title;
