import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import Button from '../shared/button/Button';
import { Variants } from '../shared/constants/variants';
import {LIMIT_CHAR} from '../../constants';
import { Size } from '../shared/constants/size';
import CheckBox from '../shared/inputs/CheckBox';
import PlotComponent from './PlotComponent';

const utils = require('../../utils');


function DashboardPlotCard(props) {
    const [plotData, setPlotData] = useState([]);
    const [yAxis2LayoutSettings, setYAxis2LayoutSettings] = useState(null);

    useEffect(() => {
        let data = [];
        let cardItems = [];
        if (props.plot.measurements && props.plot.measurements.length > 0) {
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
                        let createdAt = props.plot.measurementsCachedData[measurementLocationRaw].created_at;
                        let measurementData = JSON.parse(feature.properties[key]);

                        let textValues = [];
                        if (measurementData.attributes && Array.isArray(measurementData.attributes[intakeIndex]) && measurementData.attributes[intakeIndex].length > 0) {
                            let xValues = [], yValues = [];

                            measurementData.attributes[intakeIndex].map((item, index) => {
                                if (item === LIMIT_CHAR) {
                                    xValues.push(measurementData.timeOfMeasurement[intakeIndex][index]);
                                    yValues.push(measurementData.measurements[intakeIndex][index]);
                                    textValues.push(measurementData.measurements[intakeIndex][index] + ' ' + LIMIT_CHAR);
                                } else {
                                    textValues.push(measurementData.measurements[intakeIndex][index]);
                                }
                            });

                            if (xValues.length > 0) {
                                data.push({
                                    x: xValues,
                                    y: yValues,
                                    type: 'scattergl',
                                    mode: 'markers',
                                    hoverinfo: 'none',
                                    showlegend: false,
                                    marker: {
                                        color: 'rgba(17, 157, 255, 0)',
                                        size: 20,
                                        line: {
                                            color: 'rgb(231, 0, 0)',
                                            width: 3
                                        }
                                    },
                                });
                            }
                        } else { // Calypso stations
                            measurementData.measurements[intakeIndex].map((item, index) => {
                                textValues.push(Math.round(measurementData.measurements[intakeIndex][index] * 100) / 100);
                            });
                        }

                        let title = utils.getMeasurementTitle(feature);
                        let plotData = {
                            name: (`${title} (${measurementData.intakes ? measurementData.intakes[intakeIndex] : (intakeIndex + 1)}) - ${measurementData.title} (${measurementData.unit})`),
                            x: measurementData.timeOfMeasurement[intakeIndex],
                            y: measurementData.measurements[intakeIndex],
                            type: 'scattergl',
                            mode: 'lines+markers',
                            hoverinfo: 'text',
                            marker: {
                                color: colors[index]
                            }
                        };

                        if (textValues.length > 0) plotData.hovertext = textValues;
                        data.push(plotData);
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

            setPlotData(data);
            setYAxis2LayoutSettings(yAxis2LayoutSettings);

        }
    }, [props.plot])

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
                            {plotData.map((series) => {
                                return (
                                    <CardListItem>
                                        <Grid container>
                                            <Grid container item xs={11}>
                                                <CheckBox />
                                                <CardListLabel>
                                                <Icon name='water-wifi-solid' size={16} />
                                                <Title level={6} text={series.name} marginLeft={8} />
                                                </CardListLabel>
                                            </Grid>
                                            <Grid container item xs={1} justify="flex-end">
                                                <RemoveIconContainer>
                                                    <Icon name="cross" size={16} />
                                                </RemoveIconContainer>
                                            </Grid>
                                        </Grid>
                                    </CardListItem>
                                )
                            })}
                        </CardList>
                    </Grid>
                    <Grid container item xs={7}>
                        <PlotContainer>
                            <PlotComponent viewMode={0} height={320} index={props.index} onDelete={() => console.log("Testing")} plotMeta={props.plot} plotData={plotData} yAxis2LayoutSettings={yAxis2LayoutSettings} />
                        </PlotContainer>
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

const RemoveIconContainer = styled.div`
    width: 18px;
    height: 18px;
    margin-top: 3px;
    border: 1px solid ${props => props.theme.colors.gray[2]};
    border-radius: 50%;
    display: none;
`;

const CardListItem = styled.div`
    width: 100%;
    padding: ${props => props.theme.layout.gutter/8}px;
    vertical-align: middle;
    height: ${props => props.theme.layout.gutter}px;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    &:hover {
        background: ${props => props.theme.colors.gray[4]};
        ${RemoveIconContainer} {
            display: block;
        }
    }
`;

const CardListLabel = styled.div`
    vertical-align: middle;
    display: inline-block;
    margin-left: ${props => props.theme.layout.gutter/4}px;
`;


const PlotContainer = styled.div`
    width: 90%;
    margin-left: 5%;
`;

export default DashboardPlotCard;
