import styled from "styled-components";
import { useState, useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import UserAvatar from "./UserAvatar";
import UserProfileOptionsList from "./UserProfileOptionsList";


UserProfileButton.propTypes = {
    text: PropTypes.string.isRequired
}

function UserProfileButton(props) {

    const [showPopper, setShowPopper] = useState(false);
    const [userInitials, setUserInitials] = useState('JD');
    const buttonRef = useRef(null);
    const popperRef = useRef(null);
    const [arrowRef, setArrowRef] = useState(null);
    const { styles, attributes } = usePopper(
        buttonRef.current,
        popperRef.current,
        {
          modifiers: [
            {
              name: "arrow",
              options: {
                element: arrowRef
              }
            },
            {
              name: "offset",
              options: {
                offset: [0, 3]
              }
            },
            {
              name: "preventOverflow",
              options: {
                altAxis: true,
                padding: 10
              }
            }
          ]
        }
      );

    const setUserDetails = () => {
        try {
            if (props.authenticated) {
                let name = props.session.getUserName();
                console.log(name);
                if (name)
                    setUserInitials(name);
            }
        } catch(e) {

        }

    }

    useEffect(() => {
      document.addEventListener("mousedown", handleDocumentClick);
      return () => {
        document.removeEventListener("mousedown", handleDocumentClick);
      };
      props.backboneEvents.get().on(`session:authChange`, (authenticated) => {
        setUserDetails();
      })
    }, []);

    useEffect(() => {
        setUserDetails();
    }, [props.session, props.authenticated]);


    return (
        <>
            <div ref={buttonRef} onClick={() => setShowPopper(!showPopper)}>
                <UserAvatar text={userInitials} />
            </div>

            { showPopper ? (
                <PopperContainer
                    ref={popperRef}
                    style={styles.popper}
                    {...attributes.popper}
                >
                    <div ref={setArrowRef} style={styles.arrow} id="arrow" />
                    <UserProfileOptionsList />
                </PopperContainer>
            ) : null }

        </>
    );

    function handleDocumentClick(event) {
      if (buttonRef.current.contains(event.target) ||
          (popperRef.current && popperRef.current.contains(event.target))) {
        return;
      }
      setShowPopper(false);
    }
}

const PopperContainer = styled.div`
  box-shadow: ${({ theme }) => theme.layout.boxShadow};
  border-radius: ${({ theme }) => theme.layout.borderRadius.small}px;
  background: ${({ theme }) => theme.colors.gray[5]};
  padding: ${({ theme }) => theme.layout.gutter / 2}px;
  text-align: left;

  #arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    &:after {
      content: " ";
      background-color: ${({ theme }) => theme.colors.gray[5]};
      position: absolute;
      top: -20px;
      left: 0;
      transform: rotate(45deg);
      width: 10px;
      height: 10px;
    }
  }

  &[data-popper-placement^='top'] > #arrow {
    bottom: -30px;
    :after {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
    }
  }
`;

const mapStateToProps = state => ({
    authenticated: state.global.authenticated
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileButton);
