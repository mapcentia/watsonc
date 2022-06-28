import styled, { css } from "styled-components";
import Icon from "../icons/Icon";
import PropTypes from "prop-types";

TextInput.propTypes = {
  placeholder: PropTypes.string,
  variant: PropTypes.string,
  onChange: PropTypes.func,
};

TextInput.defaultProps = {
  variant: Variants.Transparent,
};

function TextInput(props) {
  const onChange = (event) => {
    if (props.onChange) {
      return props.onChange(event.target.value);
    }
  };
  return (
    <Container variant={props.variant}>
      <Input
        placeholder={props.placeholder}
        onChange={onChange}
        id={props.inputId}
        value={props.value}
        type={props.password ? "password" : "text"}
      ></Input>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 40px;
  border-radius: ${(props) => props.theme.layout.borderRadius.small}px;
  border: 1px solid ${(props) => props.theme.colors.gray[2]};
  width: 100%;
  color: ${(props) => props.theme.colors.gray[4]};
  > div {
    margin: 10px;
  }
  ${({ variant, theme }) => {
    const styles = {
      [Variants.Primary]: css`
        background-color: ${theme.colors.headings};
      `,
      [Variants.Transparent]: css`
        background-color: transparent;
      `,
    };
    return styles[variant];
  }}
`;

const Input = styled.input`
  background: transparent;
  height: 40px;
  box-shadow: none;
  border: 0;
  color: ${(props) => props.theme.colors.gray[5]};
  &:focus {
    outline: none;
  }
  ::placeholder {
    color: ${(props) => props.theme.colors.gray[2]};
  }
  flex: 1;
`;

export default TextInput;
