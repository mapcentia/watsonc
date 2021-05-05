import { useState, useEffect } from 'react';
import {connect} from 'react-redux'
import ProjectsApi from '../api/projects/ProjectsApi';
import Card from './shared/card/Card';
import Title from './shared/title/Title';
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import {DarkTheme} from '../themes/DarkTheme';
import {Spacing} from './shared/constants/spacing';
import {Align} from './shared/constants/align';
import Button from './shared/button/Button';
import Icon from './shared/icons/Icon';
import {Variants} from './shared/constants/variants';


function ProjectList(props) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [disableStateApply, setDisableStateApply] = useState(false);

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
                            <Grid container item xs={7}>
                                {projects.map((project, index) => {
                                    return (<Card key={index} spacing={Spacing.Lite} onClick={() => applySnapshot(project)}>
                                        <Grid container>
                                            <Grid container item md={7}>
                                                <Title text={project.title} level={4} color={DarkTheme.colors.headings} />
                                            </Grid>
                                            <Grid container item md={4} justify='flex-end'>
                                                <Icon name='hyperlink' variant={Variants.Primary} size={12} strokeColor={DarkTheme.colors.headings} />
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
`;

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
