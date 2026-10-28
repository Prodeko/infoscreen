import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Dots = styled.div`
  width: 150px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

  & div {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.blueDark};
    animation: fade 0.8s ease-in-out alternate infinite;
  }

  & div:nth-of-type(1) {
    animation-delay: -0.4s;
  }

  & div:nth-of-type(2) {
    animation-delay: -0.2s;
  }

  @keyframes fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`

export const DotLoader: React.FC = () => (
  <Container>
    <Dots>
      <div />
      <div />
      <div />
    </Dots>
  </Container>
)
