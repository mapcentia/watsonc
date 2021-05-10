import { useState, useEffect } from 'react';
import {connect} from 'react-redux'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProjectsApi from '../../api/projects/ProjectsApi';
import Card from '../shared/card/Card';
import Title from '../shared/title/Title';
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import {DarkTheme} from '../../themes/DarkTheme';
import {Spacing} from '../shared/constants/spacing';
import {Align} from '../shared/constants/align';
import Button from '../shared/button/Button';
import Icon from '../shared/icons/Icon';
import {Variants} from '../shared/constants/variants';


function ProjectList(props) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [disableStateApply, setDisableStateApply] = useState(false);
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

    const applySnapshot = (project) => {
        if (disableStateApply) {
            return;
        }
        console.log(project)
        if (props.onStateSnapshotApply) props.onStateSnapshotApply();
        setDisableStateApply(true);
        props.state.applyState(project.snapshot).then(() => {
            setDisableStateApply(false);
        });
    }

    const setHoverItem = (project) => {
        setHoveredItem(project.id);
    }

    const removeHoverItem = (event) => {
        setHoveredItem(null);
    }

    const getProjectParameters = (project) => {
        let parameters = [];
        let queryParameters = props.urlparser.urlVars;
        parameters.push(`state=${project.id}`);
        let highPriorityConfigString = false, lowPriorityConfigString = false;
        if (`config` in queryParameters && queryParameters.config) {
            lowPriorityConfigString = queryParameters.config;
        }

        if (project.snapshot && project.snapshot.meta) {
            if (project.snapshot.meta.config) {
                highPriorityConfigString = project.snapshot.meta.config;
            }

            if (project.snapshot.meta.tmpl) {
                parameters.push(`tmpl=${project.snapshot.meta.tmpl}`);
            }
        }

        let configParameter = ``;
        if (highPriorityConfigString) {
            configParameter = `config=${highPriorityConfigString}`;
            parameters.push(configParameter);
        } else if (lowPriorityConfigString) {
            configParameter = `config=${lowPriorityConfigString}`;
            parameters.push(configParameter);
        }
        return parameters;

    }

    const getPermalinkForProject = (project) => {
        let parameters = getProjectParameters(project);
        let permalink = `${window.location.origin}${props.anchor.getUri()}?${parameters.join('&')}`;
        return permalink;
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
                                    return (<Card key={index} spacing={Spacing.Lite}  onClick={() => applySnapshot(project)} onMouseEnter={() => setHoverItem(project)} onMouseLeave={removeHoverItem}>
                                        <Grid container>
                                            <Grid container item md={7}>
                                                <Icon name='dashboard' variant={Variants.Primary} strokeColor={hoveredItem == project.id ? DarkTheme.colors.primary[2] : DarkTheme.colors.primary[4]} size={24} marginRight={8} />
                                                <Title text={project.title} level={4} color={DarkTheme.colors.headings} />
                                            </Grid>
                                            <Grid container item md={5} justify='flex-end'>

                                                <IconContainer onClick={e => e.stopPropagation()}>
                                                    <CopyToClipboard text={getPermalinkForProject(project)} onCopy={() => toast.warning("Copied", { autoClose: 2000 })}>
                                                        <Icon name='hyperlink' variant={Variants.Primary} size={12} strokeColor={DarkTheme.colors.headings} />
                                                    </CopyToClipboard>
                                                </IconContainer>
                                            </Grid>
                                        </Grid>
                                    </Card>)}
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

const IconContainer = styled.div`
    display: inline-block;
    width: ${props => props.theme.layout.gutter * 3/4}px;
    height: ${props => props.theme.layout.gutter * 3/4}px;
    cursor: pointer;
    padding: 3px;
    padding-left: 5px;
    &:hover {
        border: 1px solid ${props => props.theme.colors.primary[2]};
        border-radius: ${props => props.theme.layout.borderRadius.small}px;
    }
`;

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
