import React from 'react'
import App, { Container, AppInitialProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import theme from '../assets/theme'
import withApollo from '../lib/withApollo'

interface AppProps {
  apollo: ApolloClient<object>
}

class Infoscreen extends App<AppProps> {
  public static async getInitialProps({
    Component,
    ctx,
  }): Promise<AppInitialProps> {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx })
    }

    return { pageProps }
  }

  render(): JSX.Element {
    const { Component, pageProps, apollo } = this.props

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <ThemeProvider theme={theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withApollo(Infoscreen)
