import { useState, useEffect } from 'react';
import {connect} from 'react-redux';
import Collapse from '@material-ui/core/Collapse';
import styled from 'styled-components';
import Searchbox from '../shared/inputs/Searchbox';


function ChemicalSelector(props) {
    const [chemicalsList, setChemicalsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openItems, setOpenItems] = useState({});

    const toggleOpenItem = (key) => {
        setOpenItems({...openItems, [key]: !!!openItems[key]});
    }


    useEffect(() => {
        if (!props.feature || !props.feature.properties) {
            return;
        }
        let plottedProperties = [];
        let categories = JSON.parse(JSON.stringify(props.categories));
        var parameters = props.feature.properties.parameter;
        for (let i=0; i < parameters.length; i++) {
            plottedProperties.push({
                key: props.feature.properties.ts_name[i] + "_" + i,
                intakeIndex: i,
                boreholeno: props.feature.properties.loc_id,
                title: props.feature.properties.ts_name[i],
                unit: props.feature.properties.unit[0],
                measurements: [],
                timeOfMeasurement: []
            });
        }

        const createMeasurementControl = (item, key) => {
            let display = true;
            const evaluateMeasurement = require('./../../evaluateMeasurement');
            /* if (this.state.measurementsSearchTerm.length > 0) {
                if (item.title.toLowerCase().indexOf(this.state.measurementsSearchTerm.toLowerCase()) === -1) {
                    display = false;
                }
            } */

            let control = false;
            if (display) {
                let json = item;
                // Checking if the item is the custom one
                /* if (item.key.indexOf(':') > -1) {
                    json = item;
                } else {
                    try {
                        json = JSON.parse(props.feature.properties[item.key]);
                    } catch (e) {
                        console.error(item);
                        throw new Error(`Unable to parse measurements data`);
                    }
                } */

                let intakeName = `#` + (parseInt(item.intakeIndex) + 1);
                if (`intakes` in json && Array.isArray(json.intakes) && json.intakes[item.intakeIndex] !== null) {
                    intakeName = json.intakes[item.intakeIndex] + '';
                }

                let icon = false;
                let measurementData = null;
                if (!item.custom) {
                    // measurementData = evaluateMeasurement(json, props.limits, item.key, item.intakeIndex);
                    // icon = measurementIcon.generate(measurementData.maxColor, measurementData.latestColor);
                }

                    control = (<ChemicalsListItem
                        label={item.title}
                        circleColor={DarkTheme.colors.denotive.warning}
                        key={key}
                        onAddMeasurement={props.onAddMeasurement}
                        // maxMeasurement={measurementData === null ? null : Math.round((measurementData.maxMeasurement) * 100) / 100}
                        // latestMeasurement={measurementData === null ? null : Math.round((measurementData.latestMeasurement) * 100) / 100}
                        // latestMeasurementRelative={measurementData === null ? null : Math.round((measurementData.latestMeasurement / measurementData.chemicalLimits[1]) * 100) / 100}
                        // detectionLimitReachedForMax={measurementData === null ? null : measurementData.detectionLimitReachedForMax}
                        // detectionLimitReachedForLatest={measurementData === null ? null : measurementData.detectionLimitReachedForLatest}
                        icon={icon}
                        gid={props.feature.properties.loc_id}
                        itemKey={item.key}
                        intakeIndex={item.intakeIndex}
                        intakeName={intakeName}
                        unit={item.unit}
                        title={item.title}
                        feature={props.feature.properties}
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
                        let control = createMeasurementControl(item, (item.key + '_measurement_' + index));
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
                    console.log(openItems);
                    propertiesControls.push(<><ChemicalsListTitle onClick={() => toggleOpenItem(key)}>
                    <Icon name="plus-solid" size={16} />
                    <Title level={4} text={categoryName.trim()} marginLeft={8} />
                </ChemicalsListTitle><Collapse in={!!openItems[key]}>{measurementControls}</Collapse></>);
                }
            }

            // Placing uncategorized measurements in separate category
            let uncategorizedMeasurementControls = [];
            plottedProperties.slice().map((item, index) => {
                let control = createMeasurementControl(item, (item.key + '_measurement_' + index));
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
                propertiesControls.push(<><ChemicalsListTitle onClick={() => toggleOpenItem('uncategorized')}>
                    {/*<Icon name="plus-solid" size={16} />*/}
                    {/*<Title level={4} text={__('Uncategorized')} marginLeft={8} />*/}
                </ChemicalsListTitle>
                    {/*<Collapse in={openItems['uncategorized']}>{uncategorizedMeasurementControls}</Collapse>*/}
                    <Collapse in={true}>{uncategorizedMeasurementControls}</Collapse>
                </>);
            }
        } else {
            plottedProperties.map((item, index) => {
                let control = createMeasurementControl(item, (item.key + '_measurement_' + index));
                if (control) {
                    propertiesControls.push(control);
                }
            });
        }
        setChemicalsList(propertiesControls);
    }, [props.categories, props.feature, searchTerm, openItems]);

    return (
            <Root>
                {/*<ButtonGroup align={Align.Right} spacing={2} marginTop={1}>*/}
                {/*    <Button text={__("Jupiter")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
                {/*    <Button text={__("Borpro")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
                {/*</ButtonGroup>*/}
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
    margin: 10px 0;
    cursor: pointer;
`;

const mapStateToProps = state => ({
    categories: state.global.categories,
    limits: state.global.limits,
});

const mapDispatchToProps = dispatch => ({});


export default connect(mapStateToProps, mapDispatchToProps)(ChemicalSelector);
