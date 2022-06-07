import { useState, useEffect } from 'react';
import {connect} from 'react-redux'
import ProjectsApi from '../../api/projects/ProjectsApi';
import Title from '../shared/title/Title';
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import {DarkTheme} from '../../themes/DarkTheme';
import {Align} from '../shared/constants/align';
import {Variants} from '../shared/constants/variants';
import {Size} from '../shared/constants/size';
import Button from '../shared/button/Button';
import ProjectListItem from './ProjectListItem';
import Searchbox from '../shared/inputs/Searchbox';
import base64url from "base64url";


function ProjectList(props) {
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredItem, setHoveredItem] = useState();
    const [searchTerm, setSearchTerm] = useState('');

    const getProjectParameters = (project) => {
        let parameters = [];
        let queryParameters = props.urlparser.urlVars;
        parameters.push(`state=${project.id}`);
        let config = null;

        if (project.snapshot && project.snapshot.meta) {
            if (project.snapshot.meta.config) {
                config = project.snapshot.meta.config;
            }

            if (project.snapshot.meta.tmpl) {
                parameters.push(`tmpl=${project.snapshot.meta.tmpl}`);
            }
        }

        if (!config && 'config' in queryParameters && queryParameters.config) {
            // If config is present in project meta, use that.
            // Else take it from queryparams.
            config = queryParameters.config;
        }

        if (config) {
            configParameter = `config=${highPriorityConfigString}`;
            parameters.push(configParameter);
        }
        return parameters;

    }

    const getPermalinkForProject = (project) => {
        let parameters = getProjectParameters(project);
        let permalink = `${window.location.origin}${props.anchor.getUri()}?${parameters.join('&')}`;
        return permalink;
    }

    const loadProjects = () => {
        setIsLoading(true);
        const projectsApi = new ProjectsApi();
        projectsApi.getProjects().then((response) => {
            response.text().then((text) => {
                const json =JSON.parse(base64url.decode(text));
                json.map((project) => {
                    project.permalink = getPermalinkForProject(project);
                });
                setAllProjects(json);
                setIsLoading(false);
            });
        })
    }

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        let term = searchTerm.toLowerCase();
        let projectsToShow = allProjects.filter((project) => {
            if (searchTerm.length === 0) {
                return true;
            }
            return project.title.toLowerCase().indexOf(searchTerm) > -1;
        });
        setProjects(projectsToShow);
    }, [allProjects, searchTerm]);

    return (<Root>
        {props.authenticated ? null : <Title text={__('Sign in in order to access user projects')} level={5} color={DarkTheme.colors.headings} align={Align.Center} />}
        {isLoading ? <Title text={__('Loading data...')} level={6} align='center' /> :
            <div>
                <SearchContainer>
                    <Searchbox placeholder={__('Søg efter dataparameter')} onChange={(value) => setSearchTerm(value)} />
                </SearchContainer>
                {projects.length > 0 ?
                    <div>
                        <Grid container>
                            <Grid container item xs={6}>

                                <Title text={__('My projects')} level={4} color={DarkTheme.colors.primary[4]} />
                            </Grid>
                            <Grid container item xs={6} justify='flex-end'>
                                {props.showBackButton ? <Button variant={Variants.None} onClick={() => props.setDashboardContent('charts') } text={__('Back') } size={Size.Small} /> : null}
                            </Grid>
                        </Grid>
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
    width: 100%;
`;

const SearchContainer = styled.div`
    width: 100%;
    margin: 10px 0px;
`;

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
});

const mapDispatchToProps = dispatch => ({
    setDashboardContent: (value) => dispatch(setDashboardContent(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
