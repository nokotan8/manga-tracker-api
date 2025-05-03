declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: jwt.SECRET;
        }
    }
}

export { };
