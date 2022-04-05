import { ApolloClient, InMemoryCache } from '@apollo/client'
import Cookie from 'js-cookie'

export default new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRFToken': Cookie.get('csrftoken')
  }
})
