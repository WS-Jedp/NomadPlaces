import { registerAs } from '@nestjs/config'

export default registerAs('config', () => {
    return {
        database: {
            mongo: {
                database: process.env.MONGO_DATABASE_NAME,
                port: process.env.MONGO_DATABASE_PORT
            }
        },
        keys: {
            googleMaps: process.env.GOOGLE_MAPS_API_KEY
        }
    }
})