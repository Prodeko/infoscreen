import styled, { css } from "styled-components";

const { API_URL_ROOT } = require("../../config");

const Slide = styled.div<{ highlight: boolean }>`
  ${({ theme, highlight }) =>
    highlight &&
    css`
      background: url('data:image/svg+xml, \
      <svg xmlns="http://www.w3.org/2000/svg"> \
        <style>@keyframes loop {to {stroke-dashoffset: -45px;}}</style> \
        <rect width="100%" height="100%" style="stroke: \
        ${theme.highlightColor}; stroke-width: 8px; fill: none; \
          stroke-dasharray: 30px 20px; animation: loop 0.3s infinite linear;" /> \
      </svg>');
  `}

  padding: 20px;
  width: ${({ theme }) => theme.slideWidth};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: x ${({ theme }) => theme.contentPadding};
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  box-shadow: ${({ theme }) => theme.contentBoxShadow};
  height: 100%;
`;

const SlideHeader = styled.h1`
  letter-spacing: -0.01em;
  font-weight: 900;
  font-size: 50px;
`;

const SlideContent = styled.div`
  font-weight: 400;
  font-size: 16px;
`;

export default ({ title, highlight, description }) => {
  console.log(description);
  const content = description.replace(
    /(.*)src="*([^"]+)"/g,
    `$1src=${API_URL_ROOT}$2`
  );

  return (
    <Slide highlight={highlight}>
      <SlideHeader>{title}</SlideHeader>
      <SlideContent dangerouslySetInnerHTML={{ __html: content }} />
    </Slide>
  );
};
