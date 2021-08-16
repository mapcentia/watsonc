import styled from "styled-components";
import {DarkTheme} from '../../themes/DarkTheme';
import {useContext, useState} from 'react';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import ButtonGroup from '../shared/button/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import {Variants} from '../shared/constants/variants';
import {Size} from '../shared/constants/size';
import {Align} from '../shared/constants/align';
import Icon from '../shared/icons/Icon';
import ProjectContext from '../../contexts/project/ProjectContext';

function MapDecorator(props) {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const projectContext = useContext(ProjectContext);
    console.log(showMoreInfo)
    const plot = () => {
        console.log(props.data)
        let activePlots = projectContext.activePlots;
        let allPlots = props.getAllPlots();
        [props.data].map((o) => {
            let plot = o.properties
            let plotData = {
                id: `plot_${activePlots.length + 1}`,
                title: plot.ts_name[0],
                measurements: [plot.loc_id + ":_0:0"],
                measurementsCachedData: {}
            }

            plotData.measurementsCachedData[plot.loc_id + ":_0:0"] =
                {
                    "data": {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                530079.34,
                                6224647.55
                            ]
                        },
                        "properties": {
                            "_0": JSON.stringify({
                                unit: plot.unit[0],
                                title: plot.parameter[0],
                                intakes: [1],
                                boreholeno: plot.loc_id,
                                measurements: plot.data.map(i => i.y),
                                timeOfMeasurement: plot.data.map(i => i.x)
                            }),
                            "boreholeno": plot.loc_id,
                            "numofintakes": 1
                        }
                    },
                    "created_at": "2020-09-17T07:46:53.524Z"
                };
            activePlots.push(plotData);
            allPlots.push(plotData);
        })
        activePlots = activePlots.map(plot => plot.id);
        props.setPlots(allPlots, activePlots);
        props.onActivePlotsChange(activePlots, allPlots, projectContext);
    }
    return (
        <Root>
            {showMoreInfo ? <LabelsContainer>
                <Title level={4} text={__('Nord for Tega 6B')} color={DarkTheme.colors.headings}/>
            </LabelsContainer> : <><RatingStarContainer>
                <Icon name="rating-star-solid" strokeColor={DarkTheme.colors.headings} size={16}/>
            </RatingStarContainer>
                <Img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1VUaMszH67lgK2I_K2bh6TxDdM9sxHmj5eqlQRbtx6nMETiwKpdPC7QlqfVslDjCkAGued1jHt54&usqp=CAU"/>
                <LabelsContainer>
                    <Title level={4} text={__('Nord for Tega 6B')} color={DarkTheme.colors.headings}/>
                    <Title level={6} color={DarkTheme.colors.primary[5]} text={__('Tidsserier')} marginTop={16}/>
                </LabelsContainer>
                <LinksContainer>
                    <Grid container>
                        <Icon name="analytics-board-graph-line" strokeColor={DarkTheme.colors.headings} size={16}/>
                        <Title marginTop={0} marginLeft={4} level={5} color={DarkTheme.colors.headings}
                               text={__('Filter 1 - vandstand')}/>
                    </Grid>
                    <Grid container>
                        <Icon name="analytics-board-graph-line" strokeColor={DarkTheme.colors.headings} size={16}/>
                        <Title marginTop={0} marginLeft={4} level={5} color={DarkTheme.colors.headings}
                               text={__('Filter 2 - vandstand')}/>
                    </Grid>
                </LinksContainer>
                <ButtonGroup align={Align.Center} marginTop={16} marginRight={16} marginLeft={16} spacing={4}>
                    <Button text={__("Vis alle tidsserier")} variant={Variants.Primary} size={Size.Small}
                            onClick={() => plot()} disabled={false}/>
                    <Button text={__("Mere info")} variant={Variants.Transparent} size={Size.Small}
                            onClick={() => setShowMoreInfo(true)} disabled={false}/>
                </ButtonGroup></>}
        </Root>
    )
}

const Root = styled.div`
  width: 340px;
  height: 292px;
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
  margin-top: ${props => props.theme.layout.gutter / 4}px;
  padding-left: ${props => props.theme.layout.gutter / 2}px;
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
  top: ${props => props.theme.layout.gutter / 4}px;
  right: ${props => props.theme.layout.gutter / 4}px;
`;

export default MapDecorator;
