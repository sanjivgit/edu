import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { BrandingDto, SystemSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async getBranding(tenantId?: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: tenantId ? { id: tenantId } : {},
    });
    if (!tenant) {
      // default branding for superadmin without tenant
      return {
        tenantId: 'default',
        instituteName: 'EduCore ERP',
        logo: '',
        theme: 'indigo',
        colorMode: 'light',
        tagline: 'Education Management',
      };
    }
    return {
      tenantId: tenant.id,
      instituteName: tenant.name,
      logo: tenant.logo,
      favicon: tenant.favicon,
      theme: tenant.theme,
      colorMode: tenant.colorMode,
      primaryColor: tenant.primaryColor,
      tagline: tenant.tagline,
      address: tenant.address,
      phone: tenant.phone,
      website: tenant.website,
    };
  }

  async updateBranding(dto: BrandingDto, tenantId?: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: tenantId ? { id: tenantId } : {},
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found. Contact superadmin to configure branding.');
    }
    const updated = await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: dto.instituteName ?? tenant.name,
        logo: dto.logo ?? tenant.logo,
        favicon: dto.favicon ?? tenant.favicon,
        theme: dto.theme ?? tenant.theme,
        colorMode: dto.colorMode ?? tenant.colorMode,
        primaryColor: dto.primaryColor ?? tenant.primaryColor,
        tagline: dto.tagline ?? tenant.tagline,
        address: dto.address ?? tenant.address,
        phone: dto.phone ?? tenant.phone,
        website: dto.website ?? tenant.website,
      },
    });
    return {
      tenantId: updated.id,
      instituteName: updated.name,
      logo: updated.logo,
      favicon: updated.favicon,
      theme: updated.theme,
      colorMode: updated.colorMode,
      primaryColor: updated.primaryColor,
      tagline: updated.tagline,
      address: updated.address,
      phone: updated.phone,
      website: updated.website,
    };
  }

  async getSystem(tenantId?: string) {
    const settings = await this.prisma.settings.findFirst({
      where: tenantId ? { tenantId } : {},
      include: { tenant: true },
    });
    if (!settings) {
      return {
        institution: { institutionName: 'EduCore ERP', institutionType: 'school' },
        notifications: {},
        systemConfig: {},
      };
    }
    return {
      institution: {
        institutionName: settings.institutionName,
        shortCode: settings.shortCode,
        registrationNo: settings.registrationNo,
        institutionType: settings.institutionType,
        academicYearId: settings.academicYearId,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        website: settings.website,
      },
      profile: {
        fullName: settings.tenant?.name,
      },
      notifications: settings.notificationPrefs ?? {},
      systemConfig: settings.systemConfig ?? {},
    };
  }

  async updateSystem(dto: SystemSettingsDto, tenantId?: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: tenantId ? { id: tenantId } : {},
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existing = await this.prisma.settings.findUnique({
      where: { tenantId: tenant.id },
    });

    const institution = dto.institution;
    const notificationPrefs = dto.notifications
      ? { ...(existing?.notificationPrefs as object ?? {}), ...dto.notifications }
      : existing?.notificationPrefs;

    const systemConfig = dto.systemConfig
      ? { ...(existing?.systemConfig as object ?? {}), ...dto.systemConfig }
      : existing?.systemConfig;

    if (institution) {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          name: institution.institutionName ?? tenant.name,
          phone: institution.phone ?? tenant.phone,
          website: institution.website ?? tenant.website,
        },
      });
    }

    const saved = existing
      ? await this.prisma.settings.update({
          where: { tenantId: tenant.id },
          data: {
            institutionName: institution?.institutionName ?? existing.institutionName,
            shortCode: institution?.shortCode ?? existing.shortCode,
            registrationNo: institution?.registrationNo ?? existing.registrationNo,
            institutionType: institution?.institutionType ?? existing.institutionType,
            academicYearId: institution?.academicYearId ?? existing.academicYearId,
            contactEmail: institution?.contactEmail ?? existing.contactEmail,
            phone: institution?.phone ?? existing.phone,
            website: institution?.website ?? existing.website,
            notificationPrefs: notificationPrefs as any,
            systemConfig: systemConfig as any,
          },
        })
      : await this.prisma.settings.create({
          data: {
            tenantId: tenant.id,
            institutionName: institution?.institutionName ?? tenant.name,
            shortCode: institution?.shortCode ?? '',
            registrationNo: institution?.registrationNo ?? '',
            institutionType: institution?.institutionType ?? 'school',
            academicYearId: institution?.academicYearId ?? null,
            contactEmail: institution?.contactEmail ?? '',
            phone: institution?.phone ?? tenant.phone,
            website: institution?.website ?? tenant.website,
            notificationPrefs: (notificationPrefs as any) ?? {},
            systemConfig: (systemConfig as any) ?? {},
          },
        });

    return {
      institution: {
        institutionName: saved.institutionName,
        shortCode: saved.shortCode,
        registrationNo: saved.registrationNo,
        institutionType: saved.institutionType,
        academicYearId: saved.academicYearId,
        contactEmail: saved.contactEmail,
        phone: saved.phone,
        website: saved.website,
      },
      notifications: saved.notificationPrefs ?? {},
      systemConfig: saved.systemConfig ?? {},
    };
  }

  async saveLogo(file: Express.Multer.File, tenantId?: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (tenantId) {
      await this.billingService.checkStorage(tenantId, file.size);
      await this.billingService.addStorage(tenantId, file.size);
    }
    const url = `/uploads/${file.filename}`;
    return { url, message: 'Logo uploaded successfully' };
  }
}
