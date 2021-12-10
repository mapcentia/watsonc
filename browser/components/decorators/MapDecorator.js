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
import reduxStore from "../../redux/store";
import {addBoreholeFeature} from "../../redux/actions";
import {getNewPlotId} from '../../helpers/common';

function MapDecorator(props) {
    console.log("props", props)
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const projectContext = useContext(ProjectContext);
    const plot = () => {
        // TODO Lazy load
        console.log("LAZY LOAD")
        let allPlots = props.getAllPlots();
        let plotData = {
            id: `plot_${getNewPlotId(allPlots)}`,
            title: props.data.properties.locname,
            measurements: [],
            measurementsCachedData: {}
        }
        let plot = props.data.properties;
        for (let u = 0; u < props.data.properties.data.length; u++) {
            plotData.measurements.push(plot.loc_id + ":_0:" + u.toString());
            plotData.measurementsCachedData[plot.loc_id + ":_0:" + u.toString()] =
                {
                    data: {
                        properties: {
                            "_0": JSON.stringify({
                                unit: plot.unit[u],
                                //TODO brug ts_name
                                title: plot.data[u].name,
                                // title: plot.ts_name[u],
                                intakes: [1],
                                boreholeno: plot.loc_id,
                                data: plot.data,
                                trace: plot.trace,
                                relation: props.relation
                            }),
                            "boreholeno": plot.loc_id,
                            "numofintakes": 1
                        }
                    }
                };

        }
        allPlots.unshift(plotData);

        let activePlots = allPlots.map(plot => plot.id);
        props.setPlots(allPlots, activePlots);
        props.onActivePlotsChange(activePlots, allPlots, projectContext);
    }
    const addToDashboard = () => {
        reduxStore.dispatch(addBoreholeFeature(props.data));
    }
    let links = [];

    //TODO brug ts_name
    links.push(props.data.properties.data.map((v) => {
        return (
            <Grid container>
                <Icon name="analytics-board-graph-line" strokeColor={DarkTheme.colors.headings} size={16}/>
                <Title marginTop={0} marginLeft={4} level={5} color={DarkTheme.colors.headings}
                       text={v.name}/>
            </Grid>

        )
    }))

    return (
        <Root>
            {showMoreInfo ? <LabelsContainer>
                <Title level={4} text={props.data.properties.locname} color={DarkTheme.colors.headings}/>
            </LabelsContainer> : <><RatingStarContainer>
                <Icon name="rating-star-solid" strokeColor={DarkTheme.colors.headings} size={16}/>
            </RatingStarContainer>
{/*
                <Img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1VUaMszH67lgK2I_K2bh6TxDdM9sxHmj5eqlQRbtx6nMETiwKpdPC7QlqfVslDjCkAGued1jHt54&usqp=CAU"/>
*/}
                <LabelsContainer>
                    <Title level={4} text={props.data.properties.locname} color={DarkTheme.colors.headings}/>
                    <br/>
                    <Title level={6} color={DarkTheme.colors.primary[5]} text={__('Tidsserier')} marginTop={16}/>
                </LabelsContainer>
                <LinksContainer>
                    {links}
                </LinksContainer>
                <ButtonGroup align={Align.Center} marginTop={16} marginRight={16} marginLeft={16} spacing={4}>
                    <Button text={__("Vis alle tidsserier")} variant={Variants.Primary} size={Size.Small}
                            onClick={() => plot()} disabled={false}/>
                    <Button text={__("Tilføj Dashboard")} variant={Variants.Primary} size={Size.Small}
                            onClick={() => addToDashboard()} disabled={false}/>
{/*
                    <Button text={__("Mere info")} variant={Variants.Transparent} size={Size.Small}
                            onClick={() => setShowMoreInfo(true)} disabled={false}/>
*/}
                </ButtonGroup></>}
        </Root>
    )
}

const Root = styled.div`
  width: 340px;
  //height: 292px;
  background-color: ${props => props.theme.colors.primary[2]};
  border-radius: ${props => props.theme.layout.borderRadius.medium}px;
  padding-top: 10px;
  padding-bottom: 10px;

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
