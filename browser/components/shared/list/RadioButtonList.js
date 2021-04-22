import { useState, useEffect } from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';
import RadioButton from '../inputs/RadioButton';

function RadioButtonList(props) {
    const [selectedItem, setSelectedItem] = useState([]);
    const [listItems, setListItems] = useState([]);
    var currentGroup = null;
    function onChangeRadioButton(value) {
        let selectedObject = listItems.find(item => item.value == value);
        setSelectedItem(selectedObject);
    }

    const renderItem = (item, index) => {
        let returnData = [];
        if (item.group != currentGroup) {
            returnData.push(<GroupTitle key={`${index}-title`}>{item.group}</GroupTitle>);
            currentGroup = item.group;
        }
        returnData.push(
            <ListItem key={index}>
                <RadioButton value={item.value} checked={selectedItem.value == item.value} onChange={onChangeRadioButton} label={item.label} />
            </ListItem>)
        return returnData;
    }

    useEffect(() => {
        var _listItems = [...props.listItems];
        _listItems.sort((a, b) => (a.group > b.group) ? 1 : -1);
        setListItems(_listItems);
    }, [props.listItems]);

    useEffect(() => {
        if (props.onChange) {
            props.onChange(selectedItem);
        }
    }, [selectedItem]);

    return (
        <Root>
            {listItems.map((item, index) => {
                return renderItem(item, index);
            })}
        </Root>
    )
}

RadioButtonList.propTypes = {
    listItems: PropTypes.array.isRequired,
    onChange: PropTypes.func,
}


const Root = styled.div`
`;

const GroupTitle = styled.div`
    color: ${props => props.theme.colors.gray[4]};
    font: ${props => props.theme.fonts.subbody};
    margin-top: ${props => props.theme.layout.gutter/2}px;
`;


const ListItem = styled.div`
    margin-left: ${props => props.theme.layout.gutter/4}px;
`;

export default RadioButtonList;
