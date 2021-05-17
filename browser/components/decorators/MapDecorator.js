import styled from "styled-components";
import {DarkTheme} from '../../themes/DarkTheme';
import { useState } from 'react';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import ButtonGroup from '../shared/button/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import { Variants } from '../shared/constants/variants';
import { Size } from '../shared/constants/size';
import { Align } from '../shared/constants/align';
import Icon from '../shared/icons/Icon';

function MapDecorator(props) {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    console.log(showMoreInfo)
    return (
        <Root>
            {showMoreInfo ? <LabelsContainer>
                <Title level={4} text={__('Nord for Tega 6B')} color={DarkTheme.colors.headings} />
            </LabelsContainer> : <><RatingStarContainer>
                <Icon name="rating-star-solid" strokeColor={DarkTheme.colors.headings} size={16} />
            </RatingStarContainer>
            <Img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1VUaMszH67lgK2I_K2bh6TxDdM9sxHmj5eqlQRbtx6nMETiwKpdPC7QlqfVslDjCkAGued1jHt54&usqp=CAU" />
            <LabelsContainer>
                <Title level={4} text={__('Nord for Tega 6B')} color={DarkTheme.colors.headings} />
                <Title level={6} color={DarkTheme.colors.primary[5]} text={__('Tidsserier')} marginTop={16} />
            </LabelsContainer>
            <LinksContainer>
                <Grid container>
                    <Icon name="analytics-board-graph-line" strokeColor={DarkTheme.colors.headings} size={16} />
                    <Title marginTop={0} marginLeft={4} level={5} color={DarkTheme.colors.headings} text={__('Filter 1 - vandstand')} />
                </Grid>
                <Grid container>
                    <Icon name="analytics-board-graph-line" strokeColor={DarkTheme.colors.headings} size={16} />
                    <Title marginTop={0} marginLeft={4} level={5} color={DarkTheme.colors.headings} text={__('Filter 2 - vandstand')} />
                </Grid>
            </LinksContainer>
            <ButtonGroup align={Align.Center} marginTop={16} marginRight={16} marginLeft={16} spacing={4}>
                <Button text={__("Vis alle tidsserier")} variant={Variants.Primary} size={Size.Small} onClick={() => console.log("Clicked")} disabled={false} />
                <Button text={__("Mere info")} variant={Variants.Transparent} size={Size.Small} onClick={() => setShowMoreInfo(true)} disabled={false} />
            </ButtonGroup></>}
        </Root>
    )
}

const Root = styled.div`
    width: 340px;
    height:  292px;
    background-color: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    img {
        border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    }
`;

const Img = styled.img`
    width: 100%;
    height: 125px;
`;

const LabelsContainer = styled.div`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    padding-left: ${props => props.theme.layout.gutter/2}px;
`;

const LinksContainer = styled.div`
    margin-top: 8px;
    padding-left: 16px;
    > div {
        margin-top: 8px;
    }
`;

const RatingStarContainer = styled.div`
    position: absolute;
    top: ${props => props.theme.layout.gutter/4}px;
    right: ${props => props.theme.layout.gutter/4}px;
`;

export default MapDecorator;
