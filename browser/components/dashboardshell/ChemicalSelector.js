import { useState, useEffect } from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import Searchbox from '../shared/inputs/Searchbox';
import ModalMeasurementComponent from '../ModalMeasurementComponent';


function ChemicalSelector(props) {
    const [chemicalsList, setChemicalsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!props.feature || !props.feature.properties) {
            return;
        }
        let plottedProperties = [];
        let categories = JSON.parse(JSON.stringify(props.categories));
        for (let key in props.feature.properties) {
             try {
                let data = JSON.parse(props.feature.properties[key]);
                if (typeof data === `object` && data !== null && `boreholeno` in data && `unit` in data && `title` in data
                    && `measurements` in data && `timeOfMeasurement` in data) {
                    // Regular properties ("measurements" and "timeOfMeasurement" exist)
                    let isPlottableProperty = true;
                    if (Array.isArray(data.measurements) === false) {
                        data.measurements = JSON.parse(data.measurements);
                    }

                    // Checking if number of measurements corresponds to the number of time measurements for each intake
                    data.measurements.map((measurements, intakeIndex) => {
                        if (data.measurements[intakeIndex].length !== data.timeOfMeasurement[intakeIndex].length) {
                            console.warn(`${data.title} property has not corresponding number of measurements and time measurements for intake ${intakeIndex + 1}`);
                            isPlottableProperty = false;
                        }
                    });

                    if (isPlottableProperty) {
                        for (let i = 0; i < data.measurements.length; i++) {
                            plottedProperties.push({
                                key,
                                intakeIndex: i,
                                boreholeno: data.boreholeno,
                                title: data.title,
                                unit: data.unit
                            });
                        }
                    }
                } else if (typeof data === `object` && data !== null && `title` in data && `data` in data) {
                    for (let key in data.data) {
                        for (let i = 0; i < data.data[key].data.length; i++) {
                            plottedProperties.push({
                                custom: true,
                                key: data.key + ':' + key,
                                intakeIndex: i,
                                boreholeno: props.feature.properties.boreholeno ? props.feature.properties.boreholeno : ``,
                                title: data.data[key].data[i].name,
                                data: data.data[key]
                            });
                        }
                    }
                }
            } catch (e) {
            }
        }

        const createMeasurementControl = (item, key) => {
            let display = true;
            /* if (this.state.measurementsSearchTerm.length > 0) {
                if (item.title.toLowerCase().indexOf(this.state.measurementsSearchTerm.toLowerCase()) === -1) {
                    display = false;
                }
            } */

            let control = false;
            if (display) {
                let json;
                // Checking if the item is the custom one
                if (item.key.indexOf(':') > -1) {
                    json = item;
                } else {
                    try {
                        json = JSON.parse(props.feature.properties[item.key]);
                    } catch (e) {
                        console.error(item);
                        throw new Error(`Unable to parse measurements data`);
                    }
                }

                let intakeName = `#` + (parseInt(item.intakeIndex) + 1);
                if (`intakes` in json && Array.isArray(json.intakes) && json.intakes[item.intakeIndex] !== null) {
                    intakeName = json.intakes[item.intakeIndex] + '';
                }

                let icon = false;
                let measurementData = null;
                if (!item.custom) {
                    measurementData = evaluateMeasurement(json, props.limits, item.key, item.intakeIndex);
                    icon = measurementIcon.generate(measurementData.maxColor, measurementData.latestColor);
                }

                    control = (<ChemicalsListItem
                        label={item.title}
                        circleColor={DarkTheme.colors.denotive.warning}
                        key={key}
                        onAddMeasurement={props.onAddMeasurement}
                        maxMeasurement={measurementData === null ? null : Math.round((measurementData.maxMeasurement) * 100) / 100}
                        latestMeasurement={measurementData === null ? null : Math.round((measurementData.latestMeasurement) * 100) / 100}
                        latestMeasurementRelative={measurementData === null ? null : Math.round((measurementData.latestMeasurement / measurementData.chemicalLimits[1]) * 100) / 100}
                        detectionLimitReachedForMax={measurementData === null ? null : measurementData.detectionLimitReachedForMax}
                        detectionLimitReachedForLatest={measurementData === null ? null : measurementData.detectionLimitReachedForLatest}
                        unit={item.unit}
                        icon={icon}
                        gid={props.feature.properties.boreholeno}
                        itemKey={item.key}
                        intakeIndex={item.intakeIndex}
                        intakeName={intakeName}
                        unit={item.unit}
                        title={item.title}
                    />)
            }

            return control;
        };

        let propertiesControls = [];
        if (Object.keys(categories).length > 0) {
            let numberOfDisplayedCategories = 0;
            for (let categoryName in categories) {
                let measurementsThatBelongToCategory = Object.keys(categories[categoryName]).map(e => categories[categoryName][e]);
                let measurementControls = [];
                let searchTermLower = searchTerm.toLowerCase();
                plottedProperties = plottedProperties.filter((item, index) => {
                    if (searchTerm.length && item.title.toLowerCase().indexOf(searchTermLower) === -1)
                        return false;
                    if (measurementsThatBelongToCategory.indexOf(item.title) !== -1) {
                        // Measurement is in current category
                        let control = createMeasurementControl(item, ('measurement_' + index));
                        if (control) {
                            measurementControls.push(control);
                        }

                        return false;
                    } else {
                        return true;
                    }
                });
                if (measurementControls.length > 0) {
                    measurementControls.sort(function (a, b) {
                        return (b.props.detectionLimitReachedForLatest ? 0 : b.props.latestMeasurementRelative) - (a.props.detectionLimitReachedForLatest ? 0 : a.props.latestMeasurementRelative)
                    })
                    let key = 'show' + categoryName.trim() + 'Measurements'
                    // Category has at least one displayed measurement
                    numberOfDisplayedCategories++;
                    propertiesControls.push(<><ChemicalsListTitle>
                    <Icon name="plus-solid" size={16} />
                    <Title level={4} text={categoryName.trim()} marginLeft={8} />
                </ChemicalsListTitle>{measurementControls}</>);
                }
            }

            // Placing uncategorized measurements in separate category
            let uncategorizedMeasurementControls = [];
            plottedProperties.slice().map((item, index) => {
                let control = createMeasurementControl(item, ('measurement_' + index));
                plottedProperties.splice(index, 1);
                if (control) {
                    uncategorizedMeasurementControls.push(control);
                }
            });

            if (uncategorizedMeasurementControls.length > 0) {
                uncategorizedMeasurementControls.sort(function (a, b) {
                    return (b.props.detectionLimitReachedForLatest ? 0 : b.props.latestMeasurementRelative) - (a.props.detectionLimitReachedForLatest ? 0 : a.props.latestMeasurementRelative)
                })
                // Category has at least one displayed measurement
                numberOfDisplayedCategories++;
                propertiesControls.push(<div key={`uncategorized_category_0`}>
                    <div>
                        <h5>{__(`Uncategorized`)}</h5>
                    </div>
                    <div>{uncategorizedMeasurementControls}</div>
                </div>);
            }
        } else {
            plottedProperties.map((item, index) => {
                let control = createMeasurementControl(item, (`measurement_` + index));
                if (control) {
                    propertiesControls.push(control);
                }
            });
        }
        setChemicalsList(propertiesControls);
    }, [props.categories, props.feature, searchTerm]);

    return (
            <Root>
                <ButtonGroup align={Align.Right} spacing={2} marginTop={1}>
                    <Button text={__("Jupiter")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />
                    <Button text={__("Borpro")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />
                </ButtonGroup>
                <SearchboxContainer>
                    <Searchbox placeholder={__('Søg efter dataparameter')} onChange={(value) => setSearchTerm(value)} />
                </SearchboxContainer>
                <ChemicalsList>
                    {chemicalsList}
                </ChemicalsList>
            </Root>

    )
}

const Root = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    height: 100%;
    width: 100%;
    padding: ${props => props.theme.layout.gutter/2}px;
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

const mapStateToProps = state => ({
    categories: state.global.categories,
    limits: state.global.limits,
});

const mapDispatchToProps = dispatch => ({});


export default connect(mapStateToProps, mapDispatchToProps)(ChemicalSelector);
