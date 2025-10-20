-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('event', 'venue')),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_email TEXT,
  allow_reply BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'archived')),
  flagged BOOLEAN DEFAULT false,
  organizer_user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create feedback_replies table
CREATE TABLE IF NOT EXISTS feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_listing ON feedback(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_feedback_organizer ON feedback(organizer_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback ON feedback_replies(feedback_id);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback table

-- Allow anyone to insert feedback (rate limiting handled in app)
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Only admins and organizers can view feedback
CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can view their own feedback"
  ON feedback FOR SELECT
  USING (
    organizer_user_id = auth.uid()
  );

-- Only admins and organizers can update feedback status
CREATE POLICY "Admins can update all feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can update their own feedback"
  ON feedback FOR UPDATE
  USING (
    organizer_user_id = auth.uid()
  );

-- RLS Policies for feedback_replies table

-- Only admins and organizers can insert replies
CREATE POLICY "Admins and organizers can reply"
  ON feedback_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'organizer')
    )
  );

-- Only admins and organizers can view replies
CREATE POLICY "Admins can view all replies"
  ON feedback_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can view replies to their feedback"
  ON feedback_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM feedback
      WHERE feedback.id = feedback_replies.feedback_id
      AND feedback.organizer_user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON feedback TO anon;
GRANT ALL ON feedback_replies TO authenticated;
GRANT ALL ON feedback_replies TO anon;
