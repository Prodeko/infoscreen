import React from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import Header from '../components/header'

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 190px);
  margin: 0 20px;
`

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => (
  <>
    <Head>
      <title>Prodeko Infoscreen</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Header />
    <ContentContainer>{children}</ContentContainer>
  </>
)

export default Layout
