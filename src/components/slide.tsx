import React from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import { API_URL_ROOT } from '../../config'

const SlideContainer = styled.div<{ highlight: boolean }>`
  ${({ theme, highlight }): FlattenSimpleInterpolation =>
    highlight &&
    css`
      background: url('data:image/svg+xml, \
      <svg xmlns="http://www.w3.org/2000/svg"> \
        <style>@keyframes loop {to {stroke-dashoffset: -45px;}}</style> \
        <rect width="100%" height="100%" style="stroke: \
        ${theme.highlightColor}; stroke-width: 8px; fill: none; \
          stroke-dasharray: 30px 0px; animation: loop 0.6s infinite linear;" /> \
      </svg>');
  `}
  width: ${({ theme }) => theme.slideWidth};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.contentPadding};
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  box-shadow: ${({ theme }) => theme.contentBoxShadow};
  height: 100%;
  display: flex;
  flex-direction: column;
`

const SlideHeader = styled.h1`
  letter-spacing: -0.01em;
  font-weight: 900;
  font-size: 50px;
  margin-bottom: 30px;
`

const SlideContent = styled.div`
  font-weight: 400;
  font-size: 16px;
`

const Img = styled.img`
  max-height: 30%;
  object-fit: contain;
  margin-bottom: 15px;
`

interface Props {
  title: string
  highlight: boolean
  description: string
  image: string
}

const Slide: React.FC<Props> = ({
  title,
  highlight,
  description,
  image,
}): JSX.Element => {
  const content = description.replace(
    /img alt="" (.*)src="*([^"]+)"/g,
    `$1img alt="" src=${API_URL_ROOT}$2`,
  )

  return (
    <SlideContainer highlight={highlight}>
      <SlideHeader>{title}</SlideHeader>
      <Img src={`${API_URL_ROOT}${image}`} />
      <SlideContent dangerouslySetInnerHTML={{ __html: content }} />
    </SlideContainer>
  )
}

export default Slide
