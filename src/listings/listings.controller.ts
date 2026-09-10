import { Controller, Get, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { SearchListingsDto } from './dto/search-listings.dto';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // GET /api/listings/search?make=Toyota&city=Belgrade&minPrice=5000&maxPrice=15000
  @Get('search')
  search(@Query() query: SearchListingsDto) {
    return this.listingsService.search(query);
  }
}
