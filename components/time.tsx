import React from 'react'
import styled from 'styled-components'
import { useClock } from '../hooks'

const TimeContainer = styled.span`
  position: absolute;
  top: 5px;
  left: 50px;
  color: white;
  font-size: 3.2rem;
  font-weight: 900;
  font-family: 'Arial', Courier, monospace;
  letter-spacing: -2px;
  text-shadow: ${({ theme }) => theme.textShadow};
`

const StyledDate = styled.p`
  margin-left: 7px;
  font-size: 1.5rem;
  letter-spacing: 2px;
`

const Time: React.FC = () => {
  const clock = useClock()

  if (!clock) return null

  return (
    <TimeContainer>
      {clock.time}
      <StyledDate>{clock.date}</StyledDate>
    </TimeContainer>
  )
}

export default Time
