import { useState, useEffect } from 'react';
import ProjectContext from './ProjectContext';

function ProjectProvider(props) {
    const [activePlots, setActivePlots] = useState([]);
    const [activeProfiles, setActiveProfiles] = useState([]);

    return (
        <ProjectContext.Provider value={{ activePlots, setActivePlots, activeProfiles, setActiveProfiles }}>
            {props.children}
        </ProjectContext.Provider>
    )
}

export default ProjectProvider;
