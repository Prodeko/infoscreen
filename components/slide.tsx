import React from 'react'
import styled from 'styled-components'

const SlideContainer = styled.div<{ $highlight: boolean }>`
  border: ${({ $highlight }) => $highlight && '4px solid blue'};
  margin: ${({ $highlight }) => $highlight && '-4px'};
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
  height: 80px;
`

const SlideContent = styled.div`
  font-weight: 400;
  font-size: 16px;
  overflow: hidden;
  padding-top: 20px;
`

const SlideImg = styled.div`
  flex: 1 1 auto;
  height: calc(100% - 80px);
  padding-bottom: 15px;
  text-align: center;
`

const Img = styled.img`
  object-fit: contain;
  max-height: 100%;
`

interface Props {
  title: string
  highlight: boolean
  description: string
  image?: string
}

const Slide: React.FC<Props> = ({ title, highlight, description, image }) => (
  <SlideContainer $highlight={highlight}>
    <SlideHeader>{title}</SlideHeader>
    {image && (
      <SlideImg>
        <Img src={image} alt="" />
      </SlideImg>
    )}
    {description && (
      <SlideContent dangerouslySetInnerHTML={{ __html: description }} />
    )}
  </SlideContainer>
)

export default Slide
