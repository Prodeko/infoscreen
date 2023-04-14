import withApollo from 'next-with-apollo'
import { ApolloClient, InMemoryCache } from '@apollo/client'

const GRAPHQL_URL =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'

export default withApollo(
  ({ initialState }) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new ApolloClient({
      uri: GRAPHQL_URL,
      cache: new InMemoryCache().restore(initialState || {}),
    }),
)
