import styled from 'styled-components';
import Icon from '../icons/Icon';

function Searchbox(props) {

    const onChange = (event) => {
        if (props.onChange) {
            return props.onChange(event.target.value);
        }
    }
    return (
        <Container>
            <Icon name="rating-star-solid" size={16} />
            <Input placeholder={props.placeholder} onChange={onChange}>
            </Input>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    height: 40px;
    border-radius: ${props => props.theme.layout.borderRadius.small}px;
    border: 1px solid ${props => props.theme.colors.gray[2]};
    width: 100%;
    color: ${props => props.theme.colors.gray[4]};
    > div {
        margin: 10px;
    }
`;

const Input = styled.input`
    background: transparent;
    height: 40px;
    box-shadow: none;
    border: 0;
    color: ${props => props.theme.colors.gray[5]};
    &:focus {
        outline: none;
    }
    ::placeholder {
        color: ${props => props.theme.colors.gray[4]};
    }
    flex: 1;
`;

export default Searchbox;
