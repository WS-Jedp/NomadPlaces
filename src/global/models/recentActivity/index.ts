import { Multimedia } from "@prisma/client"

export type PlaceRecentActivity =  {
    userID: string
    username: string
    userPhotoURL: string
} & Multimedia
