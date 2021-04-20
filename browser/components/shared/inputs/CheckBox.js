import styled from "styled-components";

function CheckBox(props) {
    return (<Root />);
}

const Root = styled.input.attrs({ type: 'checkbox'})`
    -webkit-appearence: none;
    height: 18px;
    width: 18px;
    &:checked {
        background-color: ${props => props.theme.colors.interaction[4]};
    }

`;

export default CheckBox;
