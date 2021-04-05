import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux'


class Modal extends React.Component {
    state = {
        selectedTheme: 'light'
    }
    render() {
        console.log(this.props);
        return (<ModalContent>
            <div className="modal-header">
                <Title>Testing Modal</Title>
            </div>
            <div className="modal-body">
                <Right>
                <select onChange={(event) => this.props.functions.setTheme(event.target.value)}>
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                </select>
                </Right>
            </div>
        </ModalContent>);
    }
}

export default Modal;

const Title = styled.div`
  color: ${({ theme }) => { console.log(theme); return theme.colors.titleColor}};
  padding: ${({ theme }) => theme.padding.titlePadding};
  text-align: center;
  font-size: 34px;
  text-transform: uppercase;
  font-weight: 700;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
`;

const Right = styled.div`
  text-align: right;
  align-items: right;
  width: 100%;
`;
