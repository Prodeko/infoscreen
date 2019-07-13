import styled from "styled-components";
import { getTime } from "../hooks";

const Time = styled.span`
  position: absolute;
  left: 20px;
  top: 10px;
  color: white;
  font-size: 42px;
  font-weight: 900;
  font-family: "Arial Black", Courier, monospace;
  letter-spacing: 5px;
`;

export default () => {
  const time = getTime();

  return <Time>{time}</Time>;
};
