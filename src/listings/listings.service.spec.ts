import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: { $transaction: jest.Mock; listing: any };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      listing: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ListingsService);
  });

  it('applies make, city, and price range filters together', async () => {
    const fakeResults = [{ id: 'listing-1' }];
    prisma.$transaction.mockResolvedValue([fakeResults, 1]);

    const result = await service.search({
      make: 'Toyota',
      city: 'Belgrade',
      minPrice: 5000,
      maxPrice: 15000,
      page: 1,
      limit: 20,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(fakeResults);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('returns empty results with correct meta when nothing matches', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    const result = await service.search({ make: 'Nonexistent', page: 1, limit: 20 });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('works with no filters at all (returns all active listings)', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 'a' }, { id: 'b' }], 2]);

    const result = await service.search({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });
});
