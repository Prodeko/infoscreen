import React from 'react'
import Head from 'next/head'

const CustomHead: React.FC<{}> = (): JSX.Element => (
  <Head>
    <title>Prodeko Infoscreen</title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <link rel="stylesheet" href="/static/css/reset.css" />
  </Head>
)

export default CustomHead
