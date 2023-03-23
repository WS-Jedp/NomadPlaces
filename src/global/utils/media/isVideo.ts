import { VIDEO_MIME_TYPES } from "src/global/types/FileTypes"

export const isVideo = (mimeType: string): boolean => {

    switch(mimeType) {
        case VIDEO_MIME_TYPES.MP4:
            return true
        case VIDEO_MIME_TYPES.QUICK_TIME:
            return true
    }

    return false
}