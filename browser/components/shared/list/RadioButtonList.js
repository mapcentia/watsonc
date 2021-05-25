import { useState, useEffect } from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';
import RadioButton from '../inputs/RadioButton';

RadioButtonList.propTypes = {
    listItems: PropTypes.array.isRequired,
    onChange: PropTypes.func,
}

function RadioButtonList(props) {
    const [selectedItem, setSelectedItem] = useState(props.selectedParameter);
    var currentGroup = null;
    function onChangeRadioButton(value) {
        let selectedObject = props.listItems.find(item => item.value == value);
        setSelectedItem(selectedObject);
    }

    const renderItem = (item, index) => {
        let returnData = [];
        if (item.group != currentGroup) {
            returnData.push(<Title key={`${index}-title`} text={item.group} level={5} marginTop={16} />);
            currentGroup = item.group;
        }
        returnData.push(
            <ListItem key={index}>
                <RadioButton value={item.value} checked={selectedItem.value == item.value} onChange={onChangeRadioButton} label={item.label} />
            </ListItem>)
        return returnData;
    }

    useEffect(() => {
        if (props.onChange) {
            props.onChange(selectedItem);
        }
    }, [selectedItem]);

    return (
        <Root>
            {props.listItems.map((item, index) => {
                return renderItem(item, index);
            })}
        </Root>
    )
}

const Root = styled.div`
    height: ${props => props.theme.layout.gutter*10}px;
    overflow-y: scroll;
    color: ${props => props.theme.colors.gray[4]};
`;


const ListItem = styled.div`
    margin-left: ${props => props.theme.layout.gutter/4}px;
    color: ${props => props.theme.colors.gray[5]};
`;

export default RadioButtonList;
