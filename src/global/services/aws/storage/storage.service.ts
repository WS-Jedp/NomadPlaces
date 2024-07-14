import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommandInput,
  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from '../../../../config'

@Injectable()
export class StorageService {

    private s3Client: S3Client
    private bucket: string
    private region: string

    constructor(@Inject(config.KEY) private configService: ConfigType<typeof config>) {
        this.region = this.configService.AWS.region
        
        this.s3Client = new S3Client({
            region: this.configService.AWS.region,
            credentials: {
                accessKeyId: this.configService.AWS.accessKeyID,
                secretAccessKey: this.configService.AWS.secretAccessKey
            }
        })

        this.bucket = this.configService.AWS.s3Bucket
    }

    async save(payload: { path: string, contentType: string, media: Buffer, metadata: { [key:string]: string }[], filename: string }) {

        const objectMetadata = payload.metadata.reduce(
            (obj, item) => ({ ...obj, ...item }),
            {}
          );

          const putObjectParams: PutObjectCommandInput = {
            Bucket: this.bucket,
            Key: payload.path,
            Body: payload.media,
            ContentType: payload.contentType,
            Metadata: objectMetadata,
            ACL: 'public-read'
          };
      
          const command = new PutObjectCommand(putObjectParams);
          await this.s3Client.send(command);

          const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${payload.path}`;

          return {
            path: url,
            bucket: this.bucket,
          };
    }

    async getPlaceStorage(placeID: string) {
        const listObjectsParams = {
            Bucket: this.bucket,
            Prefix: `/images/${placeID}`,
          };
      
          const command = new ListObjectsV2Command(listObjectsParams);
          const data = await this.s3Client.send(command);
      
          return data.Contents || [];
    }

    async getSignedUrl(key: string, expiresIn: number = 3600) {
        const getObjectParams = {
          Bucket: this.bucket,
          Key: this.bucket
        };
    
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    
        return url;
      }

}
