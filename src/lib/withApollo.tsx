import withApollo from 'next-with-apollo';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';

const GRAPHQL_URL =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [],
    },
  },
});

export default withApollo(
  ({ ctx, headers, initialState }) =>
    new ApolloClient({
      link: new HttpLink({ uri: GRAPHQL_URL }),
      cache: new InMemoryCache({ fragmentMatcher }).restore(initialState || {}),
    }),
);
