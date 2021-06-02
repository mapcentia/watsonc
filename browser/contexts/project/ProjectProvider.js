import { useState } from 'react';
import ProjectContext from './ProjectContext';

function ProjectProvider(props) {
    const [activePlots, setActivePlots] = useState([]);

    return (
        <ProjectContext.Provider value={{ activePlots, setActivePlots }}>
            {props.children}
        </ProjectContext.Provider>
    )
}

export default ProjectProvider;
