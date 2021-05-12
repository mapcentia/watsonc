import styled from "styled-components";
import {DarkTheme} from '../../themes/DarkTheme';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import ButtonGroup from '../shared/button/ButtonGroup';
import { Variants } from '../shared/constants/variants';
import { Size } from '../shared/constants/size';
import { Align } from '../shared/constants/align';

function MapDecorator(props) {
    return (
        <Root>
            <Img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1VUaMszH67lgK2I_K2bh6TxDdM9sxHmj5eqlQRbtx6nMETiwKpdPC7QlqfVslDjCkAGued1jHt54&usqp=CAU" />
            <LabelsContainer>
            <Title level={4} text={__('Nord for Tega 6B')} color={DarkTheme.colors.headings} />
            <Title level={6} color={DarkTheme.colors.primary[5]} text={__('Tidsserier')} />
            <Title level={5} color={DarkTheme.colors.headings} text={__('Filter 1 - vandstand')} />
            <Title level={5} color={DarkTheme.colors.headings} text={__('Filter 2 - vandstand')} />
            </LabelsContainer>
            <ButtonGroup align={Align.Center} marginTop={0}>
                <Button text={__("Vis alle tidsserier")} variant={Variants.Primary} size={Size.Small} onClick={() => console.log("Clicked")} />
                <Button text={__("Mere info")} variant={Variants.Transparent} size={Size.Small} onClick={() => console.log("Clicked")} />
            </ButtonGroup>
        </Root>
    )
}

const Root = styled.div`
    width: 340px;
    height:  300px;
    background-color: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
`;

const Img = styled.img`
    width: 100%;
    height: 125px;
`;

const LabelsContainer = styled.div`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    padding-left: ${props => props.theme.layout.gutter/2}px;
`;

export default MapDecorator;
