import styled from 'styled-components';
import { getTime } from '../hooks';

const Time = styled.span`
  position: absolute;
  left: 25px;
  top: 4px;
  color: white;
  font-size: 65px;
  font-weight: 900;
  font-family: 'Arial', Courier, monospace;
  letter-spacing: -2px;
  text-shadow: -3px 0px 5px rgba(0, 0, 0, 0.8);
`;

export default () => {
  const time = getTime();

  return <Time>{time}</Time>;
};
