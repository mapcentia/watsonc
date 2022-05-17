import styled from "styled-components";

function RadioButton(props) {
    return (<Root>
        <HiddenRadioButton checked={props.checked} {...props} />
        <StyledRadioButton checked={props.checked} value={props.value} onClick={() => props.onChange(props.value)}>
            <RadioButtonSelect />
        </StyledRadioButton>
        <RadioButtonLabel>{props.label}</RadioButtonLabel>

    </Root>);
}

const HiddenRadioButton = styled.input.attrs({ type: 'radio' })`
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

const RadioButtonSelect = styled.div`
    display: block;
`;

const StyledRadioButton = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.checked ? props.theme.colors.interaction[4] : '#fff'};
  transition: all 150ms;
  padding: ${props => props.theme.layout.gutter / 8}px;
  margin-right: ${props => props.theme.layout.gutter / 4}px;
  div {
    visibility: ${props => props.checked ? 'visible' : 'hidden'};
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: #000;
  }
`

const Root = styled.div`
    display: inline-block;
    vertical-align: middle;
`;

const RadioButtonLabel = styled.label`
    margin-top: ${props => props.theme.layout.gutter/4}px;
    color: ${props => props.theme.colors.gray[5]};
    font: ${props => props.theme.fonts.label};
    vertical-align: text-bottom;
`;

export default RadioButton;
