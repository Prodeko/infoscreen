import styled, { keyframes } from "styled-components";

const loop = keyframes`
  to {
    stroke-dashoffset: -15px;
  }
`;

const Rect = styled.rect`
  stroke: url(#wow);
  stroke-width: 4px;
  stroke-dasharray: 10px 5px;
  fill: none;
  animation: ${loop} 0.3s infinite linear;
`;

export default () => (
  <svg>
    <linearGradient id="wow" gradientTransform="rotate(45)">
      <stop stopColor="gold" />
      <stop stopColor="#0ac" offset="1" />
    </linearGradient>
    <Rect width="100%" height="100%" />
  </svg>
);
