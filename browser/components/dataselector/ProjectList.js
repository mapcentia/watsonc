import { useState, useEffect } from 'react';
import {connect} from 'react-redux'
import ProjectsApi from '../../api/projects/ProjectsApi';
import Title from '../shared/title/Title';
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import {DarkTheme} from '../../themes/DarkTheme';
import {Align} from '../shared/constants/align';
import Button from '../shared/button/Button';
import ProjectListItem from './ProjectListItem';


function ProjectList(props) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredItem, setHoveredItem] = useState();

    const loadProjects = () => {
        setIsLoading(true);
        const projectsApi = new ProjectsApi();
        projectsApi.getProjects().then((response) => {
            response.json().then((results) => {
                console.log(results);
                setProjects(results);
                setIsLoading(false);
            });
        })
    }

    useEffect(() => {
        loadProjects();
    }, []);

    return (<Root>
        {props.authenticated ? null : <Title text={__('Sign in in order to access user projects')} level={5} color={DarkTheme.colors.headings} align={Align.Center} />}
        {isLoading ? <Title text={__('Loading data...')} level={6} align='center' /> :
            <div>
                {projects.length > 0 ?
                    <div>
                        <Title text={__('My projects')} level={4} />
                        <Grid container>
                            <Grid container item xs={12}>
                                {projects.map((project, index) => {
                                        return <ProjectListItem project={project} {...props} key={index} />
                                    }
                                )}
                            </Grid>
                        </Grid>
                    </div> :
                    <Title text={__('No Local projects')} level={6} align={Align.Center} color={DarkTheme.colors.headings} />}
            </div>
        }
    </Root>)

}

const Root = styled.div`
    margin-top: ${props => props.theme.layout.gutter/2}px;
    margin-bottom: ${props => props.theme.layout.gutter*2}px;
`;

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
