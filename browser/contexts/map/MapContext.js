import React, { useState } from 'react';

const MapContext = React.createContext();

const MapProvider = props => {
    const [selectedBoreholes, setSelectedBoreholes] = useState([]);
    window.mapDataContext = {
        selectedBoreholes, setSelectedBoreholes
    }

    return (
        <MapContext.Provider value={{ selectedBoreholes, setSelectedBoreholes}}>
            {props.children}
        </MapContext.Provider>
    )
}

function useMapContext() {
    const context = React.useContext(MapContext);
    if(context === undefined){
        throw new Error('useAuth must be used within a AuthProvider')
    }
    return context;

}

export { MapProvider, useMapContext }
