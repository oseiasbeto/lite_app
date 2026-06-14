import Cookies from "js-cookie";

const clearSessionIdFromCookies = () => {
    Cookies.remove("session_id")
    Cookies.remove("theme")
}

export default clearSessionIdFromCookies