import styled from "styled-components";
import Time from "./time";

const HeaderImg = styled.div`
  width: 100vw;
  height: 200px;
  background-image: url("/static/images/header.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default () => (
  <div>
    <Time />
    <HeaderImg />
  </div>
);
