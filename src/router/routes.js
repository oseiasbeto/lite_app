import auth from '../views/auth/routes'
import chats from '../views/chats/routes'
import main from '../views/main/routes'
import users from '../views/users/routes'
import wallets from '../views/wallets/routes'

export default [
    ...auth,
    ...chats,
    ...main,
    ...users,
    ...wallets
]