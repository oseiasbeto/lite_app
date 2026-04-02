import auth from '../views/auth/routes'
import chats from '../views/chats/routes'
import main from '../views/main/routes'
import posts from '../views/posts/routes'
import users from '../views/users/routes'
import profiles from '../views/profiles/routes'

export default [
    ...auth,
    ...chats,
    ...main,
    ...posts,
    ...users,
    ...profiles
]