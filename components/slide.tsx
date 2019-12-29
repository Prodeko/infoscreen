import React from 'react'
import styled from 'styled-components'
import { API_URL_ROOT } from '../config'

const SlideContainer = styled.div<{ highlight: boolean }>`
  border: ${({ highlight }) => highlight && '4px solid blue'};
  margin: ${({ highlight }) => highlight && '-4px'};
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
`

const Img = styled.img`
  object-fit: contain;
  max-height: 100%;
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
      {image && (
        <SlideImg>
          <Img
            src={
              process.env.NODE_ENV === 'production'
                ? image
                : `${API_URL_ROOT}${image}`
            }
          />
        </SlideImg>
      )}
      {content && (
        <SlideContent
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === 'production' ? description : content,
          }}
        />
      )}
    </SlideContainer>
  )
}

export default Slide
