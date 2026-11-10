import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { FilesService, MAX_PHOTO_SIZE } from './files.service.js';

class UploadedPhotoDto {
  @ApiProperty({ example: '/photos/3f1c….webp', description: 'Ruta para guardar en photoUrl.' })
  url: string;
}

@ApiTags('files')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('photos')
  @ApiOperation({ summary: 'Subir foto de sucursal, alimento, bebida o combo (JPG, PNG o WebP, máx. 2 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } } })
  @ApiOkResponse({ type: UploadedPhotoDto })
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: MAX_PHOTO_SIZE, files: 1 } }))
  upload(@UploadedFile() photo: { buffer: Buffer } | undefined): Promise<UploadedPhotoDto> {
    return this.files.savePhoto(photo?.buffer);
  }
}
