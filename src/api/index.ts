import HttpClient from 'src/api/httpClient'
import auth from 'src/api/endpoints/auth'
// import admin from 'api/endpoints/admin'
import user from 'src/api/endpoints/user'
import store from 'src/api/endpoints/store'
import client from 'src/api/endpoints/client'

const httpClient = new HttpClient()

const api = {
  auth: auth(httpClient),
  // admin: admin(httpClient),
  user: user(httpClient),
  store: store(httpClient),
  
  client: client(httpClient),
}

export default api