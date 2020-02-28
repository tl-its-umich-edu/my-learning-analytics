import ApolloClient from 'apollo-boost'
import Cookie from 'js-cookie'

export default new ApolloClient({
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRFToken': Cookie.get('csrftoken')
  }
})
