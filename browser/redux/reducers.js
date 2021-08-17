import { combineReducers } from 'redux';

const initialState = {
    authenticated: false,
    categories: false,
    selectedLayers: [],
    selectedChemical: "99999",
    selectedStartDate: "",
    selectedEndDate: "",
    selectedMeasurementCount: 0,
    boreholeFeatures: [],
    boreholeChemicals: {},
    limits: {},
    dashboardMode: 'half',
    dashboardContent: 'charts'
};

const reducer = (state = initialState, action) => {
    let compoundLayerKey, selectedLayers;
    switch (action.type) {
        case 'SET_AUTHENTICATED':
            return Object.assign({}, state, {authenticated: action.payload});
        case 'SET_CATEGORIES':
            return Object.assign({}, state, {categories: action.payload});
        case 'SET_BOREHOLE_FEATURES':
            return Object.assign({}, state, {boreholeFeatures: action.payload});
        case 'ADD_BOREHOLE_FEATURE':
            let features = state.boreholeFeatures.slice(0);
             features.push(action.payload);
            return Object.assign({}, state, {boreholeFeatures: features});
        case 'SET_LIMITS':
            return Object.assign({}, state, {limits: action.payload});
        case 'SET_DASHBOARD_MODE':
            return Object.assign({}, state, {dashboardMode: action.payload});
        case 'SET_DASHBOARD_CONTENT':
            return Object.assign({}, state, {dashboardContent: action.payload});
        case 'SET_BOREHOLE_CHEMICALS':
            return Object.assign({}, state, {boreholeChemicals: action.payload});
        case 'SELECT_CHEMICAL':
            return Object.assign({}, state, {selectedChemical: action.payload});
        case 'SELECT_START_DATE':
            return Object.assign({}, state, {selectedStartDate: action.payload});
        case 'SELECT_END_DATE':
            return Object.assign({}, state, {selectedEndDate: action.payload});
        case 'SELECT_MEASUREMENT_COUNT':
            return Object.assign({}, state, {selectedMeasurementCount: action.payload});
        case 'SELECT_LAYER':
            compoundLayerKey = action.payload.originalLayerKey + (action.payload.additionalKey ? `#${action.payload.additionalKey}` : ``);
            selectedLayers = state.selectedLayers.slice(0);
            if (selectedLayers.indexOf(compoundLayerKey) === -1) selectedLayers.push(compoundLayerKey);

            return Object.assign({}, state, {selectedLayers});
        case 'UNSELECT_LAYER':
            compoundLayerKey = action.payload.originalLayerKey + (action.payload.additionalKey ? `#${action.payload.additionalKey}` : ``);
            selectedLayers = state.selectedLayers.slice(0);
            if (selectedLayers.indexOf(compoundLayerKey) !== -1) selectedLayers.splice(selectedLayers.indexOf(compoundLayerKey), 1);

            return Object.assign({}, state, {selectedLayers});
        default:
            return state
    }
}

export default combineReducers({global: reducer});
