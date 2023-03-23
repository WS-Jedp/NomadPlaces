import { GetFilesResponse, Storage } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from '../../../../config'

@Injectable()
export class StorageService {

    private storage: Storage
    private bucket: string

    constructor(@Inject(config.KEY) private configService: ConfigType<typeof config>) {
        this.storage = new Storage({
            projectId: this.configService.GCP.projectID,
            keyFilename: this.configService.GCP.jsonFileName
        })
        this.bucket = this.configService.GCP.multimediaBucket
    }

    async save(payload: { path: string, contentType: string, media: Buffer, metadata: { [key:string]: string }[] }) {

        const object = payload.metadata.reduce((obj, item) => Object.assign(obj, item));
        const file = this.storage.bucket(this.bucket).file(payload.path)
        const stream = file.createWriteStream()
        await stream.on('finish', async () => {
            return await file.setMetadata({
                metadata: object
            })
        })

        await stream.end(payload.media)

        return file
    }

    async getPlaceStorage(placeID: string): Promise<GetFilesResponse> {
        const fileResponse: GetFilesResponse = await this.storage.bucket(`${this.bucket}`).getFiles({
            prefix: `places/${placeID}`
        })
        return fileResponse;
    }

}
