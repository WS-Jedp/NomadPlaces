import { ArgumentMetadata, Injectable, PayloadTooLargeException, PipeTransform } from '@nestjs/common';
import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from 'src/global/types/FileTypes';
import { isImage } from 'src/global/utils/media/isImage';
import { isVideo } from 'src/global/utils/media/isVideo';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    const mimetype = value.mimetype
    const BYTE = 8

    if(isVideo(value.mimetype)) {
      const MBPS = 25
      const videoSizeMB = value.size / (1024 ** 2)
      const video_duration_per_Mbps = videoSizeMB * BYTE / MBPS // Seconds

      if(video_duration_per_Mbps > 10) throw new PayloadTooLargeException('The video is too long')

      return value
    }

    if(isImage(value.mimetype)) {
      const imageSizeMB = value.size / (1024 ** 2)
    if(imageSizeMB > 1000) throw new PayloadTooLargeException('The video is too long')

      return value
    }

    return value;
  }
}
