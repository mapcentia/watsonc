import { useState, useEffect } from 'react';
import ProjectsApi from '../api/projects/Projects';


function ProjectList(props) {
    const [projects, setProjects] = useState([]);

    const loadProjects = () => {
        const projectsApi = new ProjectsApi();
        projectsApi.getProjectsList().then((results) => {
            console.log(results);
            setProjects(results);
        })
    }

    useEffect(() => {
        loadProjects();
    }, []);

    return (<div>Loading data...</div>)

}

export default ProjectList
