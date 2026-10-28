import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import theme from '../assets/theme'
import '../styles/reset.css'
import '../styles/global.css'

const Infoscreen = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <ThemeProvider theme={theme}>
    <Component {...pageProps} />
  </ThemeProvider>
)

export default Infoscreen
