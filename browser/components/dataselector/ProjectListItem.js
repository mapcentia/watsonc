import { useState } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from "styled-components";
import Icon from '../shared/icons/Icon';
import {DarkTheme} from '../../themes/DarkTheme';
import {Variants} from '../shared/constants/variants';
import {Spacing} from '../shared/constants/spacing';
import Grid from '@material-ui/core/Grid';
import Title from '../shared/title/Title';

function ProjectListItem(props) {
    const [isHovered, setHover] = useState(false);
    const [disableStateApply, setDisableStateApply] = useState(false);
    const applySnapshot = () => {
        if (disableStateApply) {
            return;
        }
        if (props.onStateSnapshotApply) props.onStateSnapshotApply();
        setDisableStateApply(true);
        props.state.applyState(props.project.snapshot).then(() => {
            setDisableStateApply(false);
        });
    }

    const getProjectParameters = () => {
        let parameters = [];
        let queryParameters = props.urlparser.urlVars;
        parameters.push(`state=${props.project.id}`);
        let highPriorityConfigString = false, lowPriorityConfigString = false;
        if (`config` in queryParameters && queryParameters.config) {
            lowPriorityConfigString = queryParameters.config;
        }

        if (props.project.snapshot && props.project.snapshot.meta) {
            if (props.project.snapshot.meta.config) {
                highPriorityConfigString = props.project.snapshot.meta.config;
            }

            if (props.project.snapshot.meta.tmpl) {
                parameters.push(`tmpl=${props.project.snapshot.meta.tmpl}`);
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

    const getPermalinkForProject = () => {
        let parameters = getProjectParameters(props.project);
        let permalink = `${window.location.origin}${props.anchor.getUri()}?${parameters.join('&')}`;
        return permalink;
    }

    return (
        <Root key={index} spacing={Spacing.Lite}  onClick={() => applySnapshot()} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Grid container>
                <Grid container item md={7}>
                    <Icon name='dashboard' variant={Variants.Primary} strokeColor={isHovered ? DarkTheme.colors.primary[2] : DarkTheme.colors.primary[4]} size={24} marginRight={8} />
                    <Title text={props.project.title} level={4} color={DarkTheme.colors.headings} />
                </Grid>
                <Grid container item md={5} justify='flex-end'>

                    <IconContainer onClick={e => e.stopPropagation()}>
                        <CopyToClipboard text={getPermalinkForProject(props.project)} onCopy={() => toast.warning("Copied", { autoClose: 2000 })}>
                            <Icon name='hyperlink' variant={Variants.Primary} size={12} strokeColor={DarkTheme.colors.headings} />
                        </CopyToClipboard>
                    </IconContainer>
                </Grid>
            </Grid>
        </Root>)
}

const Root = styled.div`
    background: ${props => props.theme.colors.primary[2]};
    border-radius: ${props => props.theme.layout.borderRadius.medium}px;
    width: 100%;
    border: 0;
    box-shadow: none;
    cursor: pointer;
    margin-top: ${props => props.theme.layout.gutter/2}px;
    padding: ${props => props.theme.layout.gutter/4}px;
    &:hover {
        background: ${props => props.theme.colors.primary[5]};
    }
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

export default ProjectListItem;
