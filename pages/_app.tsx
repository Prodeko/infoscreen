import React from 'react'
import App, { AppInitialProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider, ApolloClient } from '@apollo/client'
import theme from '../assets/theme'
import withApollo from '../lib/withApollo'
import * as Sentry from '@sentry/browser'
import { SENTRY_DSN } from '../config'

Sentry.init({ dsn: SENTRY_DSN })

interface AppProps {
  apollo: ApolloClient<Record<string, unknown>>
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
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
