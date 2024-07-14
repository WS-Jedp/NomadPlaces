import { MULTIMEDIA_TYPE_ENUM } from "@prisma/client"

export const isImageOrVideo = (file: Express.Multer.File): MULTIMEDIA_TYPE_ENUM => {
    if(file.mimetype.startsWith('image')) {
        return MULTIMEDIA_TYPE_ENUM.IMAGE
    } else if(file.mimetype.startsWith('video')) {
        return MULTIMEDIA_TYPE_ENUM.VIDEO
    }

}