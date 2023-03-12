import { registerAs } from '@nestjs/config'

export default registerAs('config', () => {
    return {
        database: {
            mongo: {
                database: process.env.MONGO_DATABASE_NAME,
                port: process.env.MONGO_DATABASE_PORT,
                username: process.env.MONGO_INIT_USERNAME,
                password: process.env.MONGO_INIT_PASSWORD
            }
        },
        keys: {
            googleMaps: process.env.GOOGLE_MAPS_API_KEY
        }
    }
})