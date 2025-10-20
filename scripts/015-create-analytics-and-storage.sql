-- Create analytics tables for tracking user engagement
CREATE TABLE IF NOT EXISTS public.analytics_event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('event', 'venue')),
  listing_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_click_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('event', 'venue')),
  listing_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  click_type TEXT NOT NULL CHECK (click_type IN ('website', 'address', 'phone')),
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('event', 'venue')),
  listing_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('added', 'removed')),
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews_slider (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('event', 'venue')),
  listing_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  comment TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_views_listing ON public.analytics_event_views(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_analytics_click_outs_listing ON public.analytics_click_outs(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_analytics_favorites_listing ON public.analytics_favorites(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_reviews_slider_listing ON public.reviews_slider(listing_id, listing_type);

-- Enable RLS
ALTER TABLE public.analytics_event_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_click_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_slider ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can insert analytics (even anonymous users)
CREATE POLICY "Anyone can insert event views" ON public.analytics_event_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert click outs" ON public.analytics_click_outs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert favorites" ON public.analytics_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert reviews" ON public.reviews_slider FOR INSERT WITH CHECK (true);

-- Organizers can view their own analytics
CREATE POLICY "Organizers can view their event views" ON public.analytics_event_views FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view their click outs" ON public.analytics_click_outs FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view their favorites" ON public.analytics_favorites FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view their reviews" ON public.reviews_slider FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE organizer_id = auth.uid()
    )
  );

-- Create Supabase Storage bucket for listing images (if not exists)
-- Note: This needs to be run via Supabase Dashboard or API, not SQL
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true) ON CONFLICT DO NOTHING;

-- Storage RLS policies (run after bucket is created)
-- CREATE POLICY "Authenticated users can upload to listings bucket"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'listings');

-- CREATE POLICY "Anyone can view listings bucket"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'listings');

-- CREATE POLICY "Users can update their own uploads"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own uploads"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
