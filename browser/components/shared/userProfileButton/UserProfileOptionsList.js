import styled from "styled-components";

function UserProfileOptionsList(props) {

    return(
        <Root>
            <li onClick={() => {window.open("https://admin.calypso.watsonc.dk", "_blank");}}>Min profil</li>
            <li>Abonnement</li>
            <li>Nulstil</li>
            <li onClick={() => {window.open("http://watsonc.dk", "_blank");}}>Watsonc.dk</li>
            <li>Log ud</li>
        </Root>
    );
}

const Root = styled.ul`
    background: ${({ theme }) => theme.colors.gray[5]};
    font: ${({ theme }) => theme.fonts.body};
    list-style: none;
    margin: 0;
    padding: 0;

    li{
        padding: ${({ theme }) => theme.layout.gutter / 4}px ${({ theme }) => theme.layout.gutter / 2}px;
        border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
        cursor: pointer;
        color: ${({ theme }) => theme.colors.gray[1]};
        &:hover{
            background: ${({ theme }) => theme.colors.gray[4]};
        }
    }
`;

export default UserProfileOptionsList;
