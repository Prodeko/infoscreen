import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Restaurants from './restaurants'
import Transport from './transport'
import { SIDEBAR_SWITCH_INTERVAL } from '../config'

const SidebarContainer = styled.div`
  height: 100%;
  width: ${({ theme }) => theme.sidebarWidth};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.contentPadding};
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  box-shadow: ${({ theme }) => theme.contentBoxShadow};
  z-index: 10;
  overflow: hidden;
`

const Sidebar: React.FC = (): JSX.Element => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timeout = setInterval(() => {
      setShow((t) => !t)
    }, SIDEBAR_SWITCH_INTERVAL)
    return () => {
      clearInterval(timeout)
    }
  }, [])

  return (
    <SidebarContainer>
      {show ? <Transport /> : <Restaurants />}
    </SidebarContainer>
  )
}

export default Sidebar
