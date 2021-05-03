import { useState, useEffect } from 'react';
import ProjectsApi from '../api/projects/ProjectsApi';


function ProjectList(props) {
    const [projects, setProjects] = useState([]);

    const loadProjects = () => {
        const projectsApi = new ProjectsApi();
        projectsApi.getProjects().then((results) => {
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
