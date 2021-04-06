import styled from 'styled-components';

const Button = styled.button`
    background: ${({ theme }) => theme.buttons.background};
    color: ${({ theme }) => theme.buttons.color};
    padding: 15px;
`;

export default Button;
