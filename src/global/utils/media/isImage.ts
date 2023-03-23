import { IMAGE_MIME_TYPES } from "src/global/types/FileTypes"

export const isImage = (mimeType: string): boolean => {

    switch(mimeType) {
        case IMAGE_MIME_TYPES.JPEG:
            return true
        case IMAGE_MIME_TYPES.JPG:
            return true
        case IMAGE_MIME_TYPES.PNG:
            return true
    }

    return false
}