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
        },
        GCP: {
            projectID: process.env.GCP_PROJECT_ID,
            clientEmail: process.env.GCP_PROJECT_ID,
            privateKey: process.env.GCP_PRIVATE_KEY,
            multimediaBucket: process.env.GCP_MULTIMEDIA_BUCKET,
            jsonFileName: process.env.GCP_JSON_FILE,
        },
        JWT: {
            secret: process.env.JWT_SECRET
        }
    }
})