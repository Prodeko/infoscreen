import React from 'react'
import styled from 'styled-components'
import Restaurants from './restaurants'

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

const Sidebar: React.FC = () => (
  <SidebarContainer>
    <Restaurants />
  </SidebarContainer>
)

export default Sidebar
