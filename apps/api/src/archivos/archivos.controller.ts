import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ArchivosService, TAMANO_MAXIMO_FOTO } from './archivos.service.js';

class FotoSubidaDto {
  @ApiProperty({ example: '/fotos/3f1c….webp', description: 'Ruta para guardar en fotoUrl.' })
  url: string;
}

@ApiTags('archivos')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly archivos: ArchivosService) {}

  @Post('fotos')
  @ApiOperation({ summary: 'Subir foto de sucursal, alimento, bebida o combo (JPG, PNG o WebP, máx. 2 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { foto: { type: 'string', format: 'binary' } } } })
  @ApiOkResponse({ type: FotoSubidaDto })
  @UseInterceptors(FileInterceptor('foto', { limits: { fileSize: TAMANO_MAXIMO_FOTO, files: 1 } }))
  subir(@UploadedFile() foto: { buffer: Buffer } | undefined): Promise<FotoSubidaDto> {
    return this.archivos.guardarFoto(foto?.buffer);
  }
}
