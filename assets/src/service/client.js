import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import Cookie from 'js-cookie'

export default new ApolloClient({
  cache: new InMemoryCache(),
  assumeImmutableResults: false,
  link: new HttpLink({
    uri: '/graphql',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': Cookie.get('csrftoken')
    }
  })
})
