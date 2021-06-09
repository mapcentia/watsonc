import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '../shared/icons/Icon';
import Title from '../shared/title/Title';
import CheckBox from '../shared/inputs/CheckBox';

const utils = require('../../utils');

function CardListItem(props) {
    const [name, setName] = useState(null);
    const [infoForDeletion, setInfoForDeletion] = useState({});
    useEffect(() => {
        if (props.measurement) {
            let splitMeasurement = props.measurement.split(':');
            let measurementLength = splitMeasurement.length;
            let key = null;
            let feature = null;
            let intakeIndex = null;
            let boreholeno = splitMeasurement[0];
            if (measurementLength === 3) {
                key = splitMeasurement[1];
                intakeIndex = splitMeasurement[2];
            } else if (measurementLength === 4) {
                key = splitMeasurement[1] + ':' + splitMeasurement[2];
                intakeIndex = splitMeasurement[3];
            }
            if (props.plot.measurementsCachedData && props.plot.measurementsCachedData[props.measurement]) {
                feature = props.plot.measurementsCachedData[props.measurement].data;
                let measurementData = JSON.parse(feature.properties[key]);
                let title = utils.getMeasurementTitle(feature);
                setName(`${title} (${measurementData.intakes ? measurementData.intakes[intakeIndex] : (intakeIndex + 1)}) - ${measurementData.title} (${measurementData.unit})`);
            }
            setInfoForDeletion({
                plotId: props.plot.id,
                boreholeno, key, intakeIndex
            });
        }
    }, [props.measurement, props.plot]);

    return (
        <Root>
            <Grid container>
                <Grid container item xs={11}>
                    <CheckBox />
                    <CardListLabel>
                    <Icon name='water-wifi-solid' size={16} />
                        <Title level={6} text={name} marginLeft={8} />
                    </CardListLabel>
                </Grid>
                <Grid container item xs={1} justify="flex-end">
                    <RemoveIconContainer onClick={() => props.onDeleteMeasurement(infoForDeletion.plotId, infoForDeletion.boreholeno, infoForDeletion.key, infoForDeletion.intakeIndex)}>
                        <Icon name="cross" size={16} />
                    </RemoveIconContainer>
                </Grid>
            </Grid>
        </Root>)
}

const RemoveIconContainer = styled.div`
    width: 18px;
    height: 18px;
    margin-top: 3px;
    border: 1px solid ${props => props.theme.colors.gray[2]};
    border-radius: 50%;
    display: none;
    cursor: pointer;
`;

const Root = styled.div`
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


export default CardListItem;
