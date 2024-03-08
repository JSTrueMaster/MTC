const AUTH_TOKEN = "token"

const Jwt = {
    token: () => {
        return localStorage.getItem(AUTH_TOKEN)
    },
    setToken: (token: string) => {
        localStorage.setItem(AUTH_TOKEN, token)
    },
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN);
    }
}


export default Jwt;
