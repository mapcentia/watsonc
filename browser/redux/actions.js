export const selectChemical = chemical => ({
    type: 'SELECT_CHEMICAL',
    payload: chemical
});

export const selectLayer = (originalLayerKey, additionalKey) => ({
    type: 'SELECT_LAYER',
    payload: {originalLayerKey, additionalKey}
});

export const unselectLayer = (originalLayerKey, additionalKey) => ({
    type: 'UNSELECT_LAYER',
    payload: {originalLayerKey, additionalKey}
});

export const setCategories = (categories) => ({
    type: 'SET_CATEGORIES',
    payload: categories
});

export const setAuthenticated = (authenticated) => ({
    type: 'SET_AUTHENTICATED',
    payload: authenticated
});

export const selectStartDate = date => ({
    type: 'SELECT_START_DATE',
    payload: date
});

export const selectEndDate = date => ({
    type: 'SELECT_END_DATE',
    payload: date
});

export const selectMeasurementCount = count => ({
    type: 'SELECT_MEASUREMENT_COUNT',
    payload: count
});
