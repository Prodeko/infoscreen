import React from 'react'
import Head from '../components/head'
import Header from '../components/header'
import styled from 'styled-components'

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 190px);
  margin: 0 20px;
`

interface Props {
  children: JSX.Element[] | JSX.Element
}

const Layout: React.FC<Props> = ({ children }): JSX.Element => (
  <>
    <Head />
    <Header />
    <ContentContainer>{children}</ContentContainer>
  </>
)

export default Layout
