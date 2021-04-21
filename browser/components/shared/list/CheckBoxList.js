import { useState, useEffect } from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';
import Checkbox from '../inputs/CheckBox';

function CheckBoxList(props) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [listItems, setListItems] = useState([]);
    var currentGroup = null;
    function onChangeCheckbox(value) {
        let index = selectedItems.indexOf(value);
        let array = [...selectedItems];
        if (index > -1) {
            array.splice(index, 1);
        } else {
            array.push(value);
        }
        setSelectedItems(array);
    }

    const getSelectedItems = () => {
        let returnData = [];
        listItems.map((item) => {
            if (selectedItems.indexOf(item.value) > -1) {
                returnData.push(item);
            }
        });
        return returnData;
    }

    const renderItem = (item, index) => {
        let returnData = [];
        if (item.group != currentGroup) {
            returnData.push(<GroupTitle>{item.group}</GroupTitle>);
            currentGroup = item.group;
        }
        returnData.push(
            <ListItem key={index}>
                <Checkbox value={item.value} checked={selectedItems.indexOf(item.value) > -1} onChange={onChangeCheckbox} />
                <CheckBoxLabel>{item.label}</CheckBoxLabel>
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
            props.onChange(getSelectedItems());
        }
    }, [selectedItems]);

    return (
        <Root>
            {listItems.map((item, index) => {
                return renderItem(item, index);
            })}
        </Root>
    )
}

CheckBoxList.propTypes = {
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

const CheckBoxLabel = styled.label`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    color: ${props => props.theme.colors.gray[5]};
    font: ${props => props.theme.fonts.label};
`;

const ListItem = styled.div`
    margin-left: ${props => props.theme.layout.gutter/4}px;
`;

export default CheckBoxList;
