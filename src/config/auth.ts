export const authConfig = {
    jwt: {
        secret: process.env.AUTH_SECRET || "ASDFGHJUYTUIOPLJHGFRTYUIOPLKJHGFDSAMNBVCXZ",
        expiresIn: process.env.AUTH_EXPIRES_IN || "1d",
    }
}