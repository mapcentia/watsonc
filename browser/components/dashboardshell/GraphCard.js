import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import DashboardPlotCard from './DashboardPlotCard';
import DashboardProfileCard from './DashboardProfileCard';
import {sortableElement} from 'react-sortable-hoc';
import SortHandleComponent from './SortHandleComponent';
import PlotApi from '../../api/plots/PlotApi';
import axios from 'axios';

function GraphCard(props) {

    const download = () => {
        if (!props.plot) {
            return;
        }
        let data = [];
        props.plot.measurements.map((measurementLocationRaw, index) => {
            if (measurementLocationRaw in props.plot.measurementsCachedData &&
                props.plot.measurementsCachedData[measurementLocationRaw]) {
                let measurementLocation = measurementLocationRaw.split(':');
                if (measurementLocation.length === 3) {
                    let key = measurementLocation[1];
                    let intakeIndex = parseInt(measurementLocation[2]);

                    let feature = props.plot.measurementsCachedData[measurementLocationRaw].data;
                    let measurementData = JSON.parse(feature.properties[key]);
                    if (Array.isArray(measurementData.measurements) === false) {
                        measurementData.measurements = JSON.parse(measurementData.measurements);
                    }
                    let formatedDates = measurementData.timeOfMeasurement[intakeIndex].map(x => x.replace("T", " "));
                    data.push({
                        name: (`${feature.properties.boreholeno} - ${measurementData.title} (${measurementData.unit})`),
                        x: formatedDates,
                        y: measurementData.measurements[intakeIndex],
                    });
                } else if (measurementLocation.length === 4) {
                    let key = measurementLocation[1];
                    let customSpecificator = measurementLocation[2];

                    if ([`daily`, `weekly`, `monthly`].indexOf(customSpecificator) === -1) {
                        throw new Error(`The custom specificator (${customSpecificator}) is invalid`);
                    }

                    let feature = props.plot.measurementsCachedData[measurementLocationRaw].data;
                    let measurementData = JSON.parse(feature.properties[key]);
                    let measurementDataCopy = JSON.parse(JSON.stringify(measurementData.data));
                    data.push(measurementDataCopy[customSpecificator].data[0]);
                } else {
                    throw new Error(`Invalid key and intake notation: ${measurementLocationRaw}`);
                }

            } else {
                console.error(`Plot does not contain measurement ${measurementLocationRaw}`);
            }
        });
        const plotApi = new PlotApi();
        plotApi.downloadPlot({
            title: props.plot.title,
            data
        }).then((response) => {
            const filename = props.plot.title.replace(/\s+/g, '_').toLowerCase() + '.xlsx';
            const url = window.URL.createObjectURL(new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);

        }).catch(error => {
            console.error(error);
            alert(`Error occured while generating plot XSLS file`);
        })

    }

    return (<li className='list-group-item'><Root>
        <DashboardPlotHeader>
            <Grid container>
                <Grid container item xs={3}>
                    <HeaderActionItem>
                        <HeaderSvg>
                            <Icon name='analytics-board-graph-line' size={16}/>
                        </HeaderSvg>
                        <Title level={5} text={props.plot.title} marginLeft={4}/>
                    </HeaderActionItem>
                </Grid>
                <Grid container item xs={2}>
                    <Button variant={Variants.Primary} onClick={() => {}} size={Size.Small} text={__('Gem')}/>
                </Grid>
                <Grid container item xs={7} justify='flex-end'>
                    {props.cardType === 'plot' ? <HeaderActionItem onClick={download}>
                        <IconContainer>
                            <Icon name="arrow-down" size={16}/>
                        </IconContainer>
                        <Title marginLeft={8} level={6} text={__('Download')}/>
                    </HeaderActionItem> : null}
                    <SortHandleComponent/>
                    <CloseButton onClick={props.onRemove}>
                        <Icon name="cross" size={24}/>
                    </CloseButton>
                </Grid>
            </Grid>
        </DashboardPlotHeader>
        {props.cardType === 'plot' ? <DashboardPlotCard {...props} /> : <DashboardProfileCard {...props} />}
    </Root></li>);
}


const Root = styled.div`
  background: ${props => props.theme.colors.gray[5]};
  width: 100%;
  margin-top: ${props => props.theme.layout.gutter / 4}px;
  border-radius: ${props => props.theme.layout.borderRadius.medium}px;
  height: ${props => props.theme.layout.gutter * 12.5}px;
`;

const DashboardPlotHeader = styled.div`
  background: ${props => props.theme.colors.headings};
  height: ${props => props.theme.layout.gutter * 1.5}px;
  width: 100%;
  color: ${props => props.theme.colors.primary[2]};
  padding: ${props => props.theme.layout.gutter * 3 / 8}px ${props => props.theme.layout.gutter / 2}px;
  border-radius: ${props => props.theme.layout.borderRadius.medium}px;
`;

const HeaderSvg = styled.div`
  display: inline-block;
  padding: ${props => props.theme.layout.gutter / 8}px;
  vertical-align: middle;
`;

const HeaderActionItem = styled.div`
  margin-right: ${props => props.theme.layout.gutter / 2}px;
  vertical-align: middle;
  cursor: pointer;
`;


const IconContainer = styled.div`
  height: ${props => props.theme.layout.gutter * 3 / 4}px;
  width: ${props => props.theme.layout.gutter * 3 / 4}px;
  background: ${props => props.theme.colors.gray[4]};
  display: inline-block;
  border-radius: 50%;
  padding: ${props => props.theme.layout.gutter / 8}px;
  vertical-align: middle;
`;

const CloseButton = styled.div`
  display: inline-block;
  border-radius: ${props => props.theme.layout.borderRadius.small}px;
  border: 1px solid ${props => props.theme.colors.gray[4]};
  height: ${props => props.theme.layout.gutter * 3 / 4}px;
  cursor: pointer;
`;

export default sortableElement(GraphCard);
