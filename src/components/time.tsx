import React from 'react'
import styled from 'styled-components'
import { getTime } from '../hooks'

const TimeContainer = styled.span`
  position: absolute;
  left: 50px;
  color: white;
  font-size: 70px;
  font-weight: 900;
  font-family: 'Arial', Courier, monospace;
  letter-spacing: -2px;
  text-shadow: ${({ theme }) => theme.textShadow};
`

const Time: React.FC<{}> = (): JSX.Element => {
  const time = getTime()

  return <TimeContainer>{time}</TimeContainer>
}

export default Time
