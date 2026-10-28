import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Slide from './slide'
import { Slide as SlideType } from '../types'
import { SLIDE_CHANGE_INTERVAL } from '../lib/config'

const SlideContainer = styled.div<{ $active: boolean }>`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 1.5s ease-in-out;
`

interface Props {
  slides: SlideType[]
}

const Slides: React.FC<Props> = ({ slides }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      SLIDE_CHANGE_INTERVAL,
    )
    return () => clearInterval(interval)
  }, [slides])

  // The slide list can shrink between fetches
  const active = index % slides.length

  return (
    <>
      {slides.map((slide, i) => (
        <SlideContainer key={slide.id} $active={i === active}>
          <Slide
            title={slide.title}
            highlight={slide.highlight}
            description={slide.description}
            image={slide.image}
          />
        </SlideContainer>
      ))}
    </>
  )
}

export default Slides
