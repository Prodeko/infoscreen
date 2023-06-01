import React from 'react'
import styled from 'styled-components'
import Time from './time'

const HeaderImg = styled.div`
  width: 100vw;
  height: 160px;
  background-image: url('/static/images/header.jpg');
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
`
const TextContainer = styled.div`
  width: 100vw;
  font-family: 'Arial';
  text-align: center;
  text-shadow: ${({ theme }) => theme.textShadow};
`

const Title = styled.h1`
  color: white;
  font-size: 55px;
  letter-spacing: 20px;
  font-weight: 900;
`

const Subtitle = styled.p`
  color: white;
  font-size: 14px;
  letter-spacing: 3px;
  margin-top: 5px;
`

const Header: React.FC = (): JSX.Element => (
  <HeaderImg>
    <Time />
    <TextContainer>
      <Title>PRODEKO</Title>
      <Subtitle>
        {
          'THINK BIG | GET THINGS DONE | LEARN AND GROW | GIVE BACK | BE A GOOD PERSON'
        }
      </Subtitle>
    </TextContainer>
  </HeaderImg>
)

export default Header
