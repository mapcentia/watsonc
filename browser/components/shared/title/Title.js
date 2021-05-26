import styled, { css } from "styled-components";
import PropTypes from 'prop-types';

function Title(props) {
    return (
        <Root level={props.level} color={props.color} align={props.align}
            marginTop={props.marginTop} marginLeft={props.marginLeft}>
            {props.text}
        </Root>
    );
}
Title.propTypes = {
    text: PropTypes.string.isRequired,
    level: PropTypes.number,
    className: PropTypes.string,
    align: PropTypes.string,
    color: PropTypes.string,
    marginTop: PropTypes.number,
    marginLeft: PropTypes.number,
}

Title.defaultProps = {
    level: 1,
    align: 'left',
    marginLeft: 0,
    marginTop: 0,
    color: 'currentColor'
}

const Root = styled.div`
    display: inline-block;
    font-weight: normal;
    margin: 0;
    line-height: 1.3;
    text-align: ${props => props.align};
    margin-left: ${props => props.marginLeft || 0}px;
    ${({ level, theme }) => {
        const styles = {

            1: css `
                font: ${props => props.theme.fonts.title};
                color: ${props => props.color || props.theme.colors.headings};
            `,
            2: css `
                font: ${props => props.theme.fonts.subtitle};
            `,
            3: css `
                font: ${props => props.theme.fonts.heading};
                color: ${props => props.color || props.theme.colors.gray[3]};
            `,
            4: css `
                font: ${props => props.theme.fonts.body};
                color: ${props => props.color || props.theme.colors.primary[5]};
            `,
            5: css `
                margin-top: ${props => props.marginTop != null ? props.marginTop : props.theme.layout.gutter/2}px;
                font: ${props => props.theme.fonts.subbody};
                color: ${props => props.color || props.theme.colors.gray[4]};
            `,
            6: css `
                margin-top: ${props => props.marginTop != null ? props.marginTop : props.theme.layout.gutter/4}px;
                font: ${props => props.theme.fonts.label};
                color: ${props => props.color || props.theme.colors.gray[5]};
            `,
            7: css `
                font: ${props => props.theme.fonts.footnote};
                color: ${props => props.color || props.theme.colors.gray[5]};
            `,
        }
        return styles[level];
    }}
`
export default Title;
