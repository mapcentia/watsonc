import styled from "styled-components";
import PropTypes from 'prop-types';
import Checkbox from '../inputs/CheckBox';

function CheckBoxList(props) {
    return (
        <Root>
            <GroupTitle>
                {props.title}
            </GroupTitle>
            {props.listItems.map((item) => {
                return (
                    <ListItem>
                        <Checkbox value={item} />
                        <CheckBoxLabel>
                            {item}
                        </CheckBoxLabel>
                    </ListItem>
                )
            })}
        </Root>
    )
}

CheckBoxList.propTypes = {
    title: PropTypes.string.isRequired,
    listItems: PropTypes.array.isRequired,
}


const Root = styled.div`
    margin-top: ${props => props.theme.layout.gutter/2}px;
`;

const GroupTitle = styled.div`
    color: ${props => props.theme.colors.gray[4]};
    font: ${props => props.theme.fonts.subbody};
`;

const CheckBoxLabel = styled.label`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    color: ${props => props.theme.colors.gray[5]};
    font: ${props => props.theme.fonts.label};
`;

const ListItem = styled.div`
    margin-left: ${props => props.theme.layout.gutter/4}px;
`;

export default CheckBoxList;
