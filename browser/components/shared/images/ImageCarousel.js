import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { useState } from "react";
import { Spacing } from "../constants/spacing";
import useInterval from "../../shared/hooks/useInterval";

function ImageCarousel(props) {
  var length;
  if (typeof props.images == "undefined") {
    length = 0;
  } else {
    length = props.images.length;
  }

  const [index, setIndex] = useState(0);
  // const [lastindex, setlastindex] = useState(0);

  useInterval(() => {
    if (index === length - 1) {
      setIndex(0);
      // setlastindex(length);
    } else {
      // setlastindex(index);
      setIndex((prev) => prev + 1);
    }
  }, 4000);

  return <div>{length > 0 ? <Img src={props.images[index]} /> : null}</div>;
}

// const Root = styled.div`
//   background: ${(props) => props.theme.colors.primary[2]};
//   border-radius: ${(props) => props.theme.layout.borderRadius.medium}px;
//   width: 100%;
//   border: 0;
//   box-shadow: none;
//   margin-top: ${(props) => props.theme.layout.gutter}px;
//   padding: ${(props) => props.theme.layout.gutter / 2}px;
// `;

const Img = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  //   width: 100%;
  height: 125px;
  transition: opacity 1s;
  //   opacity: ${(props) => (props.animate ? "1" : "0")};
`;

export default ImageCarousel;
