-- Analytics Tables for CalmSeek MVP
-- Tracks views, favorites, and clicks for listings

-- Analytics Views Table
CREATE TABLE IF NOT EXISTS analytics_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL,
  user_id UUID,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Favorites Table
CREATE TABLE IF NOT EXISTS analytics_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL,
  user_id UUID,
  favorited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Clicks Table (already exists, but ensuring it's here)
CREATE TABLE IF NOT EXISTS analytics_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  user_id UUID,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_views_listing_id ON analytics_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_user_id ON analytics_views(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_viewed_at ON analytics_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_analytics_favorites_listing_id ON analytics_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_favorites_user_id ON analytics_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_favorites_favorited_at ON analytics_favorites(favorited_at);

CREATE INDEX IF NOT EXISTS idx_analytics_clicks_item_id ON analytics_clicks(item_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_user_id ON analytics_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_clicked_at ON analytics_clicks(clicked_at);

-- Enable Row Level Security
ALTER TABLE analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all inserts (tracking), admins can read all
CREATE POLICY "Allow all inserts for analytics_views" ON analytics_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts for analytics_favorites" ON analytics_favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts for analytics_clicks" ON analytics_clicks
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own analytics
CREATE POLICY "Users can read their own views" ON analytics_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own favorites" ON analytics_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own clicks" ON analytics_clicks
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON analytics_favorites
  FOR DELETE USING (auth.uid() = user_id);
