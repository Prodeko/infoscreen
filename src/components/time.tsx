import { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import { useFetch } from "../hooks";

const TIME_FETCH_INTERVAL = 600000;

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
  const [time, setTime] = useState(null);
  const serverTime = useFetch("/time", TIME_FETCH_INTERVAL);

  useEffect(() => {
    const sTime = moment(serverTime, "YYYY-MM-DD HH:mm:ss").format("HH:mm:ss");
    setTime(sTime);
    let timeout = setInterval(() => {
      setTime(t =>
        moment(t, "HH:mm:ss")
          .add(1, "seconds")
          .format("HH:mm:ss")
      );
    }, 1000);
    return () => {
      clearInterval(timeout);
    };
  }, [serverTime]);

  return <Time>{time}</Time>;
};
