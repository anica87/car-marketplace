import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { describe, it } from 'node:test';

describe('Listings search (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/listings/search returns paginated results with default params', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/listings/search')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toMatchObject({ page: 1, limit: 20 });
  });

  it('GET /api/listings/search filters by make, city, and price range', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/listings/search')
      .query({ make: 'Toyota', city: 'Belgrade', minPrice: 5000, maxPrice: 15000 })
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    // Every returned listing's car price should fall inside the requested range
    for (const listing of res.body.data) {
      expect(listing.car.price).toBeGreaterThanOrEqual(5000);
      expect(listing.car.price).toBeLessThanOrEqual(15000);
    }
  });

  it('GET /api/listings/search rejects an invalid (non-numeric) price', async () => {
    await request(app.getHttpServer())
      .get('/api/listings/search')
      .query({ minPrice: 'not-a-number' })
      .expect(400);
  });
});

function afterAll(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}
function beforeAll(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}

function expect(body: any) {
  throw new Error('Function not implemented.');
}

