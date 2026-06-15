import auth from '../views/auth/routes'
import chats from '../views/chats/routes'
import main from '../views/main/routes'
import posts from '../views/posts/routes'
import users from '../views/users/routes'
import profiles from '../views/profiles/routes'
import search from '../views/search/routes'
import settings from '../views/settings/routes'
import media from '../views/media/routes'

export default [
    ...auth,
    ...chats,
    ...main,
    ...posts,
    ...users,
    ...profiles,
    ...search,
    ...settings,
    ...media
]