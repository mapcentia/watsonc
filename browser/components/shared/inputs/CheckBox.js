import styled from "styled-components";
import Icon from '../icons/Icon';

function CheckBox(props) {
    return (<Root>
        <HiddenCheckBox checked={props.checked} {...props} />
        <StyledCheckBox checked={props.checked} value={props.value} onClick={() => props.onChange(props.value)}>
            <Icon name='check-mark-solid' size={8} strokeColor='#000' />
        </StyledCheckBox>
        <CheckBoxLabel>{props.label}</CheckBoxLabel>

    </Root>);
}

const HiddenCheckBox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`
const StyledCheckBox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 12px;
  background: ${props => props.checked ? props.theme.colors.interaction[4] : '#fff'};
  border-radius: 3px;
  transition: all 150ms;
  padding-left: ${props => props.theme.layout.gutter / 8}px;
  margin-right: ${props => props.theme.layout.gutter / 4}px;
  div {
    visibility: ${props => props.checked ? 'visible' : 'hidden'}
  }
`

const Root = styled.div`
    display: inline-block;
    vertical-align: middle;
`;

const CheckBoxLabel = styled.label`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    color: ${props => props.theme.colors.gray[5]};
    font: ${props => props.theme.fonts.label};
`;

export default CheckBox;
