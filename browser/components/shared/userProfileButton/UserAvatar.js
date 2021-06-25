import styled from "styled-components";
import PropTypes from 'prop-types';

UserAvatar.propTypes = {
    text: PropTypes.string.isRequired
}

function UserAvatar(props) {

    return(
        <Avatar>
            {props.text.toUpperCase()}
        </Avatar>
    );
}

const Avatar = styled.div`
    background: ${({ theme }) => theme.colors.primary[5]};
    border-radius: 50%;
    height: 44px;
    width: 44px;
    color: white;
    font: ${({ theme }) => theme.fonts.heading};
    display: flex;
    text-align: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;

    :hover {
        background: ${({ theme }) => theme.colors.primary[3]};
    }
`;

export default UserAvatar;