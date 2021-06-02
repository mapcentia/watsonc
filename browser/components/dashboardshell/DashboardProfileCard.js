import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import { Variants } from '../shared/constants/variants';
import { Size } from '../shared/constants/size';
import PlotComponent from '../PlotComponent';

function DashboardPlotCard(props) {
    return (
        <Root>
            <DashboardPlotHeader>
                <Grid container>
                    <Grid container item xs={3}>
                        <HeaderActionItem>
                            <HeaderSvg>
                                <Icon name='analytics-board-graph-line' size={16} />
                            </HeaderSvg>
                            <Title level={5} text={__('Tidsserie uden navn')} marginLeft={4} />
                        </HeaderActionItem>
                    </Grid>
                    <Grid container item xs={2}>
                        <Button variant={Variants.Primary} size={Size.Small} text={__('Gem')} />
                    </Grid>
                    <Grid container item xs={7} justify='flex-end'>
                        <HeaderActionItem>
                            <IconContainer>
                                <Icon name="arrow-down" size={16} />
                            </IconContainer>
                            <Title marginLeft={8} level={6} text={__('Download')} />
                        </HeaderActionItem>
                        <HeaderActionItem>
                            <IconContainer>
                                <Icon name="drag-handle" size={16} />
                            </IconContainer>
                            <Title marginLeft={8} level={6} text={__('Flyt')} />
                        </HeaderActionItem>
                        <CloseButton>
                            <Icon name="cross" size={24} />
                        </CloseButton>
                    </Grid>
                </Grid>
            </DashboardPlotHeader>
            <DashboardPlotContent>
                <Grid container>
                    <Grid container item xs={5}>
                        <CardList>
                            <CardListItem>
                                <CardListLabel>
                                    <Icon name='drill' size={16} />
                                    <Title level={6} text='16.334' marginLeft={8} />
                                </CardListLabel>
                            </CardListItem>
                            <CardListItem>
                                <CardListLabel>
                                    <Icon name='water-wifi-solid' size={16} />
                                    <Title level={6} text={__('Vandstandsmaler, syd')} marginLeft={8} />
                                </CardListLabel>
                            </CardListItem>
                            <CardListItem>
                                <CardListLabel>
                                    <Icon name='water-wifi-solid' size={16} />
                                    <Title level={6} text={__('Vandstandmaler, nord')} marginLeft={8} />
                                </CardListLabel>
                            </CardListItem>
                        </CardList>
                    </Grid>
                    <Grid container item xs={7}>
                        <ProfileComponent height={320} index={props.index} onDelete={() => console.log("Testing")} onClick={() => console.log("Testing")} plotMeta={props.plot} />
                    </Grid>
                </Grid>
            </DashboardPlotContent>
        </Root>
    )
}

const Root = styled.div`
    background: ${props => props.theme.colors.gray[5]};
    width: 100%;
    margin-top: ${props => props.theme.layout.gutter/4}px;
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    height: ${props => props.theme.layout.gutter*12.5}px;
`;

const DashboardPlotHeader = styled.div`
    background: ${props => props.theme.colors.headings};
    height: ${props => props.theme.layout.gutter*1.5}px;
    width: 100%;
    color: ${props => props.theme.colors.primary[2]};
    padding: ${props => props.theme.layout.gutter*3/8}px ${props => props.theme.layout.gutter/2}px;
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
`;

const HeaderSvg = styled.div`
    display: inline-block;
    padding: ${props => props.theme.layout.gutter/8}px;
    vertical-align: middle;
`;

const HeaderActionItem = styled.div`
    margin-right: ${props => props.theme.layout.gutter/2}px;
    vertical-align: middle;
`;

const IconContainer = styled.div`
    height: ${props => props.theme.layout.gutter*3/4}px;
    width: ${props => props.theme.layout.gutter*3/4}px;
    background: ${props => props.theme.colors.gray[4]};
    display: inline-block;
    border-radius: 50%;
    padding: ${props => props.theme.layout.gutter/8}px;
    vertical-align: middle;
`;

const CloseButton = styled.div`
    display: inline-block;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    border: 1px solid ${props => props.theme.colors.gray[4]};
    height: ${props => props.theme.layout.gutter * 3 / 4}px;
`;

const DashboardPlotContent = styled.div`
    padding: ${props => props.theme.layout.gutter/2}px;
`;

const CardList = styled.div`
    height: 100%;
    width: 95%;
    vertical-align: middle;
`;

const CardListItem = styled.div`
    width: 100%;
    padding: ${props => props.theme.layout.gutter/8}px;
    vertical-align: middle;
    height: ${props => props.theme.layout.gutter}px;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    &:hover {
        background: ${props => props.theme.colors.gray[4]};
    }
`;

const CardListLabel = styled.div`
    vertical-align: middle;
    display: inline-block;
    margin-left: ${props => props.theme.layout.gutter/4}px;
`;

export default DashboardPlotCard;
