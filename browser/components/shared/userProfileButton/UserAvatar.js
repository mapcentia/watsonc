import styled from "styled-components";
import PropTypes from 'prop-types';
import Icon from '../icons/Icon';

function UserAvatar(props) {

    return(
        <Avatar>
            <Icon name='avatar' size={24} />
        </Avatar>
    );
}

const Avatar = styled.div`
    background: ${({ theme }) => theme.colors.primary[5]};
    border-radius: 50%;
    padding-left: 10px;
    height: 44px;
    width: 44px;
    color: white;
    font: ${({ theme }) => theme.fonts.heading};
    display: flex;
    text-align: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    padding-left: 10px;

    :hover {
        background: ${({ theme }) => theme.colors.primary[3]};
    }
`;

export default UserAvatar;
