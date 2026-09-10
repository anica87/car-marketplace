import { Injectable } from '@nestjs/common';
import { Prisma, ListingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchListingsDto } from './dto/search-listings.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchListingsDto) {
    const { make, city, minPrice, maxPrice, page = 1, limit = 20 } = query;

    // Only active listings are searchable; each filter is added only
    // when the caller actually provided it.
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
      car: {
        ...(make && { make: { contains: make, mode: 'insensitive' } }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }),
      },
    };

    const [results, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          car: {
            select: {
              make: true,
              model: true,
              year: true,
              price: true,
              condition: true,
            },
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
