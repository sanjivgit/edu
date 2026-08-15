import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SettingsService } from './settings.service';
import { BrandingDto, SystemSettingsDto } from './dto/settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('settings')
@Controller('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('branding')
  getBranding(@CurrentUser('tenantId') tenantId?: string) {
    return this.settingsService.getBranding(tenantId);
  }

  @Put('branding')
  updateBranding(@Body() dto: BrandingDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.settingsService.updateBranding(dto, tenantId);
  }

  @Get('system')
  getSystem(@CurrentUser('tenantId') tenantId?: string) {
    return this.settingsService.getSystem(tenantId);
  }

  @Put('system')
  updateSystem(@Body() dto: SystemSettingsDto, @CurrentUser('tenantId') tenantId?: string) {
    return this.settingsService.updateSystem(dto, tenantId);
  }

  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const name = `logo-${uuidv4()}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.settingsService.saveLogo(file, tenantId);
  }
}
