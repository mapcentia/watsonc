import {useState, useEffect} from "react";
import {connect} from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import styled from "styled-components";
import Searchbox from "../shared/inputs/Searchbox";
import ChemicalsListItem from "./ChemicalsListItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import {DarkTheme} from "../../themes/DarkTheme";

function ChemicalSelector(props) {
    const [chemicalsList, setChemicalsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openItems, setOpenItems] = useState({});
    const [loadingData, setLoadingData] = useState(false);

    const toggleOpenItem = (key) => {
        setOpenItems({...openItems, [key]: !!!openItems[key]});
    };

    useEffect(() => {
        setLoadingData(true);
        if (!props.feature || !props.feature.properties) {
            return;
        }
        // let plottedProperties = [];
        console.log("PROPS", props.feature)
        let parameters = props.feature.properties.parameter;
        // for (let i = 0; i < parameters.length; i++) {
        //     plottedProperties.push({
        //         key: props.feature.properties.loc_id + "_" + i,
        //         intakeIndex: i,
        //         boreholeno: props.feature.properties.loc_id,
        //         measurements: [],
        //         timeOfMeasurement: [],
        //     });
        // }

        const createMeasurementControl = (item, key) => {
            return new Promise(function (resolve, reject) {
                const relation = item.feature.properties.relation;
                const loc_id = item.feature.properties.loc_id;
                fetch(
                    `/api/sql/jupiter?q=SELECT gid,active_locations,count,enddate,startdate,trace,ts_id,images,locname,loc_id,ts_name,parameter,unit FROM ${relation} WHERE loc_id=${loc_id}&base64=false&lifetime=60&srs=4326`
                ).then(res => {
                    res.json().then(json => {
                        if (!res.ok) {
                            reject(json);
                        }
                        let properties = json.features[0].properties;
                        let controls = [];
                        properties.ts_name.forEach((prop, index) => {
                            properties.relation = relation;
                            let intakeName = `#` + properties.ts_id[index];
                            let icon = false;
                            controls.push(
                                <ChemicalsListItem
                                    label={
                                        properties.ts_name[index]
                                            ? properties.ts_name[index] + " " + properties.parameter[index] + ", (" + properties.unit[index] + ")"
                                            : properties.parameter[index] + ", (" + properties.unit[index] + ")"
                                    }
                                    circleColor={DarkTheme.colors.denotive.warning}
                                    key={properties.loc_id + '_' + properties.ts_id[index]}
                                    onAddMeasurement={props.onAddMeasurement}
                                    description={properties.parameter[index] + ", (" + properties.unit[index] + ")"}
                                    icon={icon}
                                    gid={loc_id}
                                    itemKey={properties.locname + '_' + properties.ts_id[index]}
                                    intakeIndex={properties.ts_id[index]}
                                    intakeName={intakeName}
                                    unit={properties.unit[index]}
                                    title={properties.ts_name[index]}
                                    feature={properties}
                                />
                            );
                        });
                        // let allChems = (
                        //     <ChemicalsListItem
                        //         label={"Alle parametre"}
                        //         circleColor={DarkTheme.colors.denotive.warning}
                        //         key={"allParameters" + "_" + properties.loc_id}
                        //         onAddMeasurement={props.onAddMeasurement}
                        //         description={""}
                        //         gid={properties.loc_id}
                        //         itemKey={plottedProperties.map((elem) => elem.key)}
                        //         intakeIndex={plottedProperties.map((elem) => elem.intakeIndex)}
                        //         feature={props.feature.properties}
                        //     />
                        // );
                        resolve(controls)
                    })
                }, err => {
                    alert(err.message)
                })
            });
        };

        let searchTermLower = searchTerm.toLowerCase();

        // plottedProperties = plottedProperties.filter((item, index) => {
        //     if (
        //         searchTerm.length &&
        //         item.title.toLowerCase().indexOf(searchTermLower) === -1 &&
        //         item.parameter.toLowerCase().indexOf(searchTermLower) === -1
        //     ) {
        //         return false;
        //     } else {
        //         return true;
        //     }
        // });


        // let promises = [];
        // plottedProperties.map((item, index) => {
        //     promises.push(createMeasurementControl(item, item.key + "_measurement_" + index, index));
        // });
        createMeasurementControl(props).then(controls => {
            setLoadingData(false);
            // controls.unshift(allChems)
            setChemicalsList(controls);
        }).catch(json => {
            alert(json.message);
            setLoadingData(false);
        });
    }, [props.categories, props.feature, searchTerm, openItems]);

    return (
        <Root>
            {/*<ButtonGroup align={Align.Right} spacing={2} marginTop={1}>*/}
            {/*    <Button text={__("Jupiter")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
            {/*    <Button text={__("Borpro")} variant={Variants.Secondary} onClick={() => console.log("Clicked")} size={Size.Small} />*/}
            {/*</ButtonGroup>*/}
            <SearchboxContainer>
                {loadingData && (
                    <div
                        style={{
                            justifyContent: "center",
                            left: "50%",
                            top: "50%",
                            position: "absolute",
                            zIndex: 9000,
                        }}
                    >
                        <CircularProgress
                            style={{color: DarkTheme.colors.interaction[4]}}
                        />
                    </div>
                )}
                <Searchbox
                    placeholder={__("Søg efter dataparameter")}
                    onChange={(value) => setSearchTerm(value)}
                />
            </SearchboxContainer>
            <ChemicalsList>{chemicalsList}</ChemicalsList>
        </Root>
    );
}

const Root = styled.div`
  background: ${(props) => props.theme.colors.primary[2]};
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  height: 100%;
  width: 100%;
  padding: ${(props) => props.theme.layout.gutter / 2}px;
`;

const SearchboxContainer = styled.div`
  position: relative;
  width: 100%;
    //   padding: ${(props) => props.theme.layout.gutter / 2}px 0px;
`;

const ChemicalsList = styled.div`
  width: 100%;
  padding: ${(props) => props.theme.layout.gutter / 4}px;
`;

const ChemicalsListTitle = styled.div`
  color: ${(props) => props.theme.colors.headings};
  margin: 10px 0;
  cursor: pointer;
`;

const mapStateToProps = (state) => ({
    categories: state.global.categories,
    limits: state.global.limits,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChemicalSelector);
