import React, { useState, useEffect } from 'react'
import { useTransition, animated, config } from 'react-spring'
import styled from 'styled-components'
import { DotLoader } from '../components/loading'
import Slide from './slide'
import { Slide as SlideType } from '../types'
import { SLIDE_CHANGE_INTERVAL } from '../../config'

const SlideContainer = styled(animated.div)`
  position: absolute;
  height: 100%;
  width: 100%;
  margin-left: 0 20px;
`

interface Props {
  slides: SlideType[]
}

const Slides: React.FC<Props> = ({ slides }): JSX.Element => {
  const [index, setIndex] = useState(0)

  const transitions = useTransition(slides[index], slide => slide.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.molasses,
  })

  useEffect(() => {
    const interval = setInterval(
      () => setIndex(state => (state + 1) % slides.length),
      SLIDE_CHANGE_INTERVAL,
    )
    return () => {
      clearInterval(interval)
    }
  }, [slides])

  if (!slides) return <DotLoader />

  return (
    <>
      {transitions.map(
        ({ item, props, key }): JSX.Element => (
          <SlideContainer key={key} style={props}>
            <Slide
              title={item.title}
              highlight={item.highlight}
              description={item.description}
              image={item.image}
            />
          </SlideContainer>
        ),
      )}
    </>
  )
}

export default Slides
