import styled from 'styled-components';
import { hexToRgbA } from '../../helpers/colors';
import Grid from '@material-ui/core/Grid';
import { DarkTheme } from '../../themes/DarkTheme';
import ButtonGroup from '../shared/button/ButtonGroup';
import Button from '../shared/button/Button';
import { Variants } from '../shared/constants/variants';
import { Align } from '../shared/constants/align';
import Icon from '../shared/icons/Icon';
import Searchbox from '../shared/inputs/Searchbox';
import ChemicalsListItem from './ChemicalsListItem';
import DashboardPlotCard from './DashboardPlotCard';
import DashboardProfileCard from './DashboardProfileCard';

function DashboardContent(props) {
    console.log(props);
    return (
        <Root>
            <Grid container>
                <Grid container item xs={5}>
                    <DashboardList>
                        <Grid container>
                            <Grid container item xs={5}>
                                <DashboardListTitle>
                                    <Icon name="pin-location-solid" size={16} strokeColor={DarkTheme.colors.headings} />
                                    <Title level={4} color={DarkTheme.colors.headings} text={__('Valgte datakilder')} marginLeft={8} />
                                </DashboardListTitle>
                                <DashboardListItem>
                                    <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                    <Title level={6} text='13.344' marginLeft={8} />
                                </DashboardListItem>
                                <DashboardListItem>
                                    <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                    <Title level={6} text='13.947' marginLeft={8} />
                                </DashboardListItem>
                                <DashboardListItem>
                                    <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                    <Title level={6} text='13.478' marginLeft={8} />
                                </DashboardListItem>
                                <DashboardListItem>
                                    <Icon name="water-wifi-solid" size={12} />
                                    <Title level={6} text={__('Vandstandsmaler')} marginLeft={8} />
                                </DashboardListItem>
                                <DashboardListItem>
                                    <Icon name="water-wifi-solid" size={12} />
                                    <Title level={6} text={__('Lokalitet 234.432')} marginLeft={8} />
                                </DashboardListItem>
                                <DashboardListItem>
                                    <Icon name="water-wifi-solid" size={12} />
                                    <Title level={6} text={__('Lokalitet 345.543')} marginLeft={8} />
                                </DashboardListItem>
                                <FavoritterList>
                                    <DashboardListTitle>
                                        <Icon name="star-solid" size={16} />
                                        <Title level={4} text={__('Favoritter')} marginLeft={8} />
                                    </DashboardListTitle>
                                    <FavoritterListTitle>
                                        <Icon name="drill-space-solid" size={16} />
                                        <Title level={5} text={__('Kildeplads')} marginLeft={8} />
                                    </FavoritterListTitle>
                                    <DashboardListItem>
                                        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text='13.344' marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text='13.947' marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="drill" size={16} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text='13.478' marginLeft={8} />
                                    </DashboardListItem>
                                    <FavoritterListTitle>
                                        <Icon name="folder-solid" size={16} />
                                        <Title level={5} text={__('Omrade B')} marginLeft={8} />
                                    </FavoritterListTitle>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 213.312')} marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 243.442')} marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 745.553')} marginLeft={8} />
                                    </DashboardListItem>
                                    <FavoritterListTitle>
                                        <Icon name="folder-solid" size={16} />
                                        <Title level={5} text={__('Omrade C')} marginLeft={8} />
                                    </FavoritterListTitle>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 773.312')} marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 883.442')} marginLeft={8} />
                                    </DashboardListItem>
                                    <DashboardListItem>
                                        <Icon name="water-wifi-solid" size={8} strokeColor={DarkTheme.colors.headings} />
                                        <Title level={6} text={__('Lokalitet 799.553')} marginLeft={8} />
                                    </DashboardListItem>
                                </FavoritterList>
                            </Grid>
                            <Grid container item xs={7}>
                                <ChemicalSelector>

                                    <ButtonGroup align={Align.Right} spacing={2} marginTop={1}>
                                        <Button text={__("Jupiter")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />
                                        <Button text={__("Borpro")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />
                                    </ButtonGroup>
                                    <SearchboxContainer>
                                        <Searchbox placeholder={__('Søg efter dataparameter')} />
                                    </SearchboxContainer>
                                    <ChemicalsList>
                                        <ChemicalsListTitle>
                                            <Icon name="plus-solid" size={16} />
                                            <Title level={4} text={__('Tilstandsparametre')} marginLeft={8} />
                                        </ChemicalsListTitle>
                                        <ChemicalsListItem label='Vandstand(sensor)' description='Historisk < 5cm | Seneste < 5cm' circleColor={DarkTheme.colors.denotive.error} />
                                        <ChemicalsListItem label='Vandstand(model)' description='Historisk 218cm | Seneste 196cm' circleColor={DarkTheme.colors.denotive.warning} />
                                        <ChemicalsListItem label='Flow(sensor)' description='Historisk 0.03 ltr/min | Seneste < 0.001 ltr/min' circleColor={DarkTheme.colors.denotive.success} />
                                        <ChemicalsListItem label='Flow(model)' description='Historisk 28 ltr/min | Seneste 29 ltr/min' circleColor={DarkTheme.colors.denotive.success} />
                                    </ChemicalsList>
                                </ChemicalSelector>
                            </Grid>
                        </Grid>
                    </DashboardList>
                </Grid>
                <Grid container item xs={7}>
                    <ChartsContainer>
                        {props.activePlots.map((plot, index) => {
                                return <DashboardPlotCard plot={plot} index={index} key={index} />
                        })}
                        {props.activeProfiles.map((profile, index) => {
                            return <DashboardProfileCard meta={profile} index={index} key={index} />
                        })}
                    </ChartsContainer>
                </Grid>
            </Grid>
        </Root>
    )
}

const Root = styled.div`
    height: 100%;
    width: 100%;
    background-color: ${props => hexToRgbA(props.theme.colors.primary[1], 0.92)};
    overflow: scroll;
`

const DashboardList = styled.div`
    background-color: ${props => props.theme.colors.primary[1]};
    padding: ${props => props.theme.layout.gutter/2}px ${props => props.theme.layout.gutter}px;
    width: 100%;
    height: 100%;
    overflow: scroll;
`;

const DashboardListTitle = styled.div`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    width: 100%;
    color: ${props => props.theme.colors.headings};
`;

const DashboardListItem = styled.div`
    margin-top: ${props => props.theme.layout.gutter/8}px;
    padding: ${props => props.theme.layout.gutter/8}px 0px;
    width: 100%;
    color: ${props => props.theme.colors.gray[4]};
    &:hover {
        background-color: ${props => props.theme.colors.primary[2]};
        color: ${props => props.theme.colors.headings};
    }
`;

const ChemicalSelector = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    height: 100%;
    width: 100%;
    padding: ${props => props.theme.layout.gutter/2}px;
`;

const FavoritterList = styled.div`
    margin-top: ${props => props.theme.layout.gutter}px;
    height: auto;
`;

const FavoritterListTitle = styled.div`
    color: ${props => props.theme.colors.primary[5]};
    margin-top: ${props => props.theme.layout.gutter/2}px;
`;

const SearchboxContainer = styled.div`
    width: 100%;
    padding: ${props => props.theme.layout.gutter/2}px 0px;
`;

const ChemicalsList = styled.div`
    width: 100%;
    padding: ${props => props.theme.layout.gutter/4}px;
`

const ChemicalsListTitle = styled.div`
    color: ${props => props.theme.colors.headings};
`;

const ChartsContainer = styled.div`
    width: 100%;
    padding-left: ${props => props.theme.layout.gutter*2}px;
    padding-right: ${props => props.theme.layout.gutter/4}px;
    height: 100%;
    overflow: scroll;
`

export default DashboardContent;
