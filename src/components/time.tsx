import { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";

const Time = styled.span`
  position: absolute;
  left: 40px;
  top: 20px;
  color: white;
  font-size: 42px;
  font-weight: 900;
  font-family: "Courier New", Courier, monospace;
`;

export default () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const time = moment().format("HH:mm:ss");
      setTime(time);
    }, 1000);
  });
  return <Time>{time}</Time>;
};
