import React from 'react';
import styled from 'styled-components';
import { Variants } from '../../constants';
import Button from '../shared/button/Button';


class Modal extends React.Component {
    render() {
        console.log(this.props);
        return (<ModalContent>
            <div className="modal-header">
                <Title>Testing Modal</Title>
            </div>
            <div className="modal-body">
                <Right>
                <Button variant={Variants.Primary} text="Primary Button"
                    onClick={() => window.alert("Primary Button")}>
                </Button>
                <Button variant={Variants.Secondary} text="Secondary Button"
                    onClick={() => window.alert("Secondary Button")}>
                </Button>
                </Right>
            </div>
        </ModalContent>);
    }
}

export default Modal;

const Title = styled.div`
  color: ${({ theme }) => { return theme.colors.headings}};
  padding: ${({ theme }) => theme.padding.titlePadding};
  text-align: center;
  font-size: 34px;
  text-transform: uppercase;
  font-weight: 700;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
`;

const Right = styled.div`
  text-align: right;
  align-items: right;
  width: 100%;
`;
