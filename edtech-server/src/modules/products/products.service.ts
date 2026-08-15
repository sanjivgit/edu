import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto, tenantId?: string) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { category: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((p) => ({ ...p, price: Number(p.price) })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return { ...product, price: Number(product.price) };
  }

  async create(dto: CreateProductDto, tenantId?: string) {
    const existing = await this.prisma.product.findFirst({ where: { sku: dto.sku } });
    if (existing) throw new BadRequestException(`Product with SKU ${dto.sku} already exists`);
    return this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        category: dto.category,
        stock: dto.stock ?? 0,
        price: dto.price,
        status: dto.status ?? 'active',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku,
        category: dto.category,
        stock: dto.stock,
        price: dto.price,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }

  async stats(tenantId?: string) {
    const [totalProducts, activeProducts, lowStock] = await Promise.all([
      this.prisma.product.count({ where: tenantId ? { tenantId } : {} }),
      this.prisma.product.count({
        where: { ...(tenantId ? { tenantId } : {}), status: 'active' as any },
      }),
      this.prisma.product.count({
        where: { ...(tenantId ? { tenantId } : {}), stock: { lte: 5 } },
      }),
    ]);
    const agg = await this.prisma.product.aggregate({
      where: tenantId ? { tenantId } : {},
      _sum: { price: true },
    });
    return {
      totalProducts,
      activeProducts,
      lowStockProducts: lowStock,
      inventoryValue: Number(agg._sum.price ?? 0),
    };
  }
}
