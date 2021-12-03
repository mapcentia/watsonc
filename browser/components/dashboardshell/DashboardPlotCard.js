import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useDrop} from 'react-dnd';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import {Variants} from '../shared/constants/variants';
import {LIMIT_CHAR} from '../../constants';
import {Size} from '../shared/constants/size';
import CheckBox from '../shared/inputs/CheckBox';
import PlotComponent from './PlotComponent';
import CardListItem from './CardListItem';

const utils = require('../../utils');


function DashboardPlotCard(props) {
    const [plotData, setPlotData] = useState([]);
    const [yAxis2LayoutSettings, setYAxis2LayoutSettings] = useState(null);
    const [collectedProps, drop] = useDrop(() => ({
        accept: 'MEASUREMENT',
        drop: props.onDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    }));
    useEffect(() => {
        let data = [];
        let cardItems = [];
        if (props.plot && props.plot.measurements && props.plot.measurements.length > 0) {
            let colors = ['rgb(19,128,196)', 'rgb(16,174,140)', 'rgb(235,96,29)', 'rgb(247,168,77)', 'rgb(119,203,231)', `black`]

            let minTime = false;
            let maxTime = false;

            let yAxis2LayoutSettingsObj = false;
            props.plot.measurements.map((measurementLocationRaw, index) => {
                if (props.plot.measurementsCachedData && measurementLocationRaw in props.plot.measurementsCachedData &&
                    props.plot.measurementsCachedData[measurementLocationRaw] &&
                    props.plot.measurementsCachedData[measurementLocationRaw].data
                ) {
                    let measurementLocation = measurementLocationRaw.split(':');
                    let feature = props.plot.measurementsCachedData[measurementLocationRaw].data;
                    if (measurementLocation.length === 3) {
                        let key = measurementLocation[1];
                        let intakeIndex = measurementLocation[2];
                        let measurementData = JSON.parse(feature.properties[key]);
                        // Merge trace and data
                        const plotInfoMergedWithTrace = {...measurementData.data[intakeIndex], ...measurementData.trace[intakeIndex]}
                        data.push(plotInfoMergedWithTrace);

                    } else if (measurementLocation.length === 4) {
                        let key = measurementLocation[1];
                        let customSpecificator = measurementLocation[2];

                        if ([`daily`, `weekly`, `monthly`].indexOf(customSpecificator) === -1) {
                            throw new Error(`The custom specificator (${customSpecificator}) is invalid`);
                        }

                        let measurementData = JSON.parse(feature.properties[key]);
                        let measurementDataCopy = JSON.parse(JSON.stringify(measurementData.data));
                        data.push(measurementDataCopy[customSpecificator].data[0]);

                        let range = [0, 0];
                        for (let key in measurementDataCopy) {
                            if (measurementDataCopy[key].layout.yaxis2.range) {
                                if (measurementDataCopy[key].layout.yaxis2.range[0] < range[0]) range[0] = measurementDataCopy[key].layout.yaxis2.range[0];
                                if (measurementDataCopy[key].layout.yaxis2.range[1] > range[1]) range[1] = measurementDataCopy[key].layout.yaxis2.range[1];
                            }

                            yAxis2LayoutSettingsObj = measurementDataCopy[key].layout.yaxis2;
                        }

                        yAxis2LayoutSettingsObj.range = range;
                        yAxis2LayoutSettingsObj.showgrid = false;
                    } else {
                        throw new Error(`Invalid key and intake notation: ${measurementLocationRaw}`);
                    }
                } else {
                    console.info(`Plot does not contain measurement ${measurementLocationRaw}`);
                }
            });


        }
        setPlotData(data);
        setYAxis2LayoutSettings(yAxis2LayoutSettings);
    }, [props.plot])

    return (
        <DashboardPlotContent ref={drop}>
            <Grid container>
                <Grid container item xs={2}>
                    <CardList>
                        {props.plot?.measurements?.map((measurement, index) => {
                            return (
                                <CardListItem measurement={measurement} plot={props.plot}
                                              onDeleteMeasurement={props.onDeleteMeasurement} key={index}/>
                            )
                        })}
                    </CardList>
                </Grid>
                <Grid container item xs={10}>
                    <PlotContainer>
                        <PlotComponent viewMode={0} height={370} index={props.index}
                                       onDelete={() => console.log("Testing")} plotMeta={props.plot} plotData={plotData}
                                       yAxis2LayoutSettings={yAxis2LayoutSettings}/>
                    </PlotContainer>
                </Grid>
            </Grid>
        </DashboardPlotContent>
    )
}

const DashboardPlotContent = styled.div`
  padding: ${props => props.theme.layout.gutter / 2}px;
`;

const CardList = styled.div`
  height: 100%;
  width: 95%;
  vertical-align: middle;
`;


const PlotContainer = styled.div`
  width: 100%;
  margin-left: 10px;
`;

export default DashboardPlotCard;
