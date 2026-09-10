-- Enable trigram extension: speeds up ILIKE '%value%' partial-match queries
-- (this is what Prisma generates for `contains` + `mode: 'insensitive'`)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for fast partial-text matching on make/model
CREATE INDEX IF NOT EXISTS idx_cars_make_trgm ON cars USING GIN (make gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cars_model_trgm ON cars USING GIN (model gin_trgm_ops);

-- Plain indexes for the other filters used in the search query
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_status_created_at ON listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price);

-- Full-text search: a generated column combining make, model, variant, and
-- description into a single searchable tsvector. Postgres keeps this in
-- sync automatically on every INSERT/UPDATE — no application code needed.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(make, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(variant, '') || ' ' ||
      coalesce(description, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_cars_search_vector ON cars USING GIN (search_vector);
