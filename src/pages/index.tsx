import React from 'react'
import { NextPage } from 'next'
import styled from 'styled-components'
import Layout from '../layouts/layout'
import Slides from '../components/slides'
import Sidebar from '../components/sidebar'
import { getSlides } from '../hooks'
import '../assets/global.less'

const SlidesContainer = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;
`

const Index: NextPage = (): JSX.Element => {
  const slides = getSlides()

  return (
    <Layout>
      <Sidebar />
      <SlidesContainer>
        <Slides slides={slides} />
      </SlidesContainer>
    </Layout>
  )
}

export default Index
