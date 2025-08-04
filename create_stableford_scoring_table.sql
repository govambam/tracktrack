-- Create stableford_scoring table for customizable Stableford scoring systems
CREATE TABLE IF NOT EXISTS public.stableford_scoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    albatross INTEGER NOT NULL DEFAULT 5,
    eagle INTEGER NOT NULL DEFAULT 4,
    birdie INTEGER NOT NULL DEFAULT 3,
    par INTEGER NOT NULL DEFAULT 2,
    bogey INTEGER NOT NULL DEFAULT 1,
    double_bogey INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key constraint to events table
    CONSTRAINT fk_stableford_scoring_event_id 
        FOREIGN KEY (event_id) 
        REFERENCES public.events(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to ensure one scoring system per event
    CONSTRAINT unique_event_stableford_scoring 
        UNIQUE (event_id)
);

-- Create index for faster lookups by event_id
CREATE INDEX IF NOT EXISTS idx_stableford_scoring_event_id 
    ON public.stableford_scoring(event_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at column
CREATE TRIGGER trigger_stableford_scoring_updated_at
    BEFORE UPDATE ON public.stableford_scoring
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.stableford_scoring ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for authenticated users to select stableford scoring for events they can access
CREATE POLICY "Users can view stableford scoring for accessible events" 
    ON public.stableford_scoring 
    FOR SELECT 
    TO authenticated
    USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE user_id = auth.uid() 
            OR is_private = false
        )
    );

-- Policy for event owners to insert stableford scoring
CREATE POLICY "Event owners can insert stableford scoring" 
    ON public.stableford_scoring 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        event_id IN (
            SELECT id FROM public.events 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for event owners to update stableford scoring
CREATE POLICY "Event owners can update stableford scoring" 
    ON public.stableford_scoring 
    FOR UPDATE 
    TO authenticated
    USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        event_id IN (
            SELECT id FROM public.events 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for event owners to delete stableford scoring
CREATE POLICY "Event owners can delete stableford scoring" 
    ON public.stableford_scoring 
    FOR DELETE 
    TO authenticated
    USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE user_id = auth.uid()
        )
    );

-- Add helpful comments
COMMENT ON TABLE public.stableford_scoring IS 'Custom Stableford scoring systems for golf events';
COMMENT ON COLUMN public.stableford_scoring.event_id IS 'Foreign key to events table';
COMMENT ON COLUMN public.stableford_scoring.albatross IS 'Points awarded for albatross (3 under par)';
COMMENT ON COLUMN public.stableford_scoring.eagle IS 'Points awarded for eagle (2 under par)';
COMMENT ON COLUMN public.stableford_scoring.birdie IS 'Points awarded for birdie (1 under par)';
COMMENT ON COLUMN public.stableford_scoring.par IS 'Points awarded for par';
COMMENT ON COLUMN public.stableford_scoring.bogey IS 'Points awarded for bogey (1 over par)';
COMMENT ON COLUMN public.stableford_scoring.double_bogey IS 'Points awarded for double bogey or worse (2+ over par)';
