import React from 'react'
import App, { AppInitialProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import theme from '../assets/theme'
import withApollo from '../lib/withApollo'
import * as Sentry from '@sentry/browser'
import { SENTRY_DSN } from '../config'

Sentry.init({ dsn: SENTRY_DSN })

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

  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })

      Sentry.captureException(error)
    })

    super.componentDidCatch(error, errorInfo)
  }

  render(): JSX.Element {
    const { Component, pageProps, apollo } = this.props

    return (
      <ApolloProvider client={apollo}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    )
  }
}

export default withApollo(Infoscreen)
