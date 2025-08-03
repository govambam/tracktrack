-- Manual sync script to populate event_courses table from existing event_rounds data
-- Run this in Supabase SQL Editor if you have existing events that need course sync

-- First, let's see what we have in event_rounds
-- SELECT DISTINCT event_id, course_name FROM event_rounds WHERE course_name IS NOT NULL AND course_name != '';

-- Create a function to sync courses for all events
CREATE OR REPLACE FUNCTION sync_all_event_courses()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    round_record RECORD;
    course_exists BOOLEAN;
    display_counter INTEGER;
BEGIN
    -- Loop through all events that have rounds
    FOR event_record IN 
        SELECT DISTINCT event_id 
        FROM event_rounds 
        WHERE course_name IS NOT NULL AND course_name != ''
    LOOP
        RAISE NOTICE 'Processing event: %', event_record.event_id;
        
        -- Delete existing event_courses for this event
        DELETE FROM event_courses WHERE event_id = event_record.event_id;
        
        display_counter := 1;
        
        -- Loop through rounds for this event and get unique course names
        FOR round_record IN 
            SELECT DISTINCT course_name 
            FROM event_rounds 
            WHERE event_id = event_record.event_id 
            AND course_name IS NOT NULL 
            AND course_name != ''
            ORDER BY course_name
        LOOP
            -- Insert unique course
            INSERT INTO event_courses (
                event_id, 
                name, 
                display_order,
                par,
                yardage,
                description,
                image_url,
                weather_note
            ) VALUES (
                event_record.event_id,
                round_record.course_name,
                display_counter,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL
            );
            
            display_counter := display_counter + 1;
            RAISE NOTICE 'Added course: % for event: %', round_record.course_name, event_record.event_id;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Course sync completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Run the sync function
SELECT sync_all_event_courses();

-- Clean up the function
DROP FUNCTION sync_all_event_courses();

-- Verify the results
SELECT 
    e.name as event_name,
    ec.name as course_name,
    ec.display_order,
    COUNT(er.id) as rounds_count
FROM event_courses ec
JOIN events e ON ec.event_id = e.id
LEFT JOIN event_rounds er ON er.event_id = ec.event_id AND er.course_name = ec.name
GROUP BY e.name, ec.name, ec.display_order, ec.event_id
ORDER BY e.name, ec.display_order;
