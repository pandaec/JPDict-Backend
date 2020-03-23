interface JwtToken {
    id: string,
    username: string,
    iat: number,
    exp: number,
}


interface Sense{
    pos: string[],
    definitions: string[],
}

interface Word{
    reading: string,
    accent: string,
    senses: Sense[],
    altWords: string[]
}

interface UserRegister{
    username: string,
    email: string,
    password: string,
}

interface User{
    username: string,
    pwHash: string,
}

export {JwtToken, Sense, Word, UserRegister, User};