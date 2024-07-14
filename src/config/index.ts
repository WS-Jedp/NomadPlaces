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
        AWS: {
            accessKeyID: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
            s3Bucket: process.env.AWS_S3_BUCKET_NAME,
            sesUser: process.env.AWS_SES_USER,
            sesPassword: process.env.AWS_SES_PASSWORD
        },
        JWT: {
            secret: process.env.JWT_SECRET
        },
        REDIS: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    }
})