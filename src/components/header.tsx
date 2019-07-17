import styled from 'styled-components';
import Time from './time';

const HeaderImg = styled.div`
  width: 100vw;
  height: 180px;
  background-image: url('/static/images/header.png');
  background-position: top;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default () => (
  <div>
    <Time />
    <HeaderImg />
  </div>
);
