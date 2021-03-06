import { combineReducers } from 'redux';

const initialState = {
    authenticated: false,
    categories: false,
    selectedLayers: [],
    selectedChemical: "99999",
    selectedStartDate: "",
    selectedEndDate: "",
    selectedMeasurementCount: 0
};

const reducer = (state = initialState, action) => {
    let compoundLayerKey, selectedLayers;
    switch (action.type) {
        case 'SET_AUTHENTICATED':
            return Object.assign({}, state, {authenticated: action.payload});
        case 'SET_CATEGORIES':
            return Object.assign({}, state, {categories: action.payload});
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
