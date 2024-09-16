import styled, { css } from "styled-components";
import PropTypes from 'prop-types';
import { Spacing } from '../constants/spacing';

function Card(props) {

    return (
        <Root>
            {props.children}
        </Root>
    );
}

const Root = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    width: 100%;
    border: 0;
    box-shadow: none;
    margin-top: ${props => props.theme.layout.gutter}px;
    padding: ${props => props.theme.layout.gutter/2}px;
`;

export default Card;
