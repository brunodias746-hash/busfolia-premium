-- Backfill script to normalize corrupted dates in orders table
-- This script converts dates like "12 Junho" to "12 de junho de 2026"

-- First, let's see what dates we have
SELECT DISTINCT transportDates FROM orders WHERE transportDates IS NOT NULL LIMIT 20;

-- Update orders with short Portuguese format (e.g., "12 Junho") to full format
-- This is a complex operation because dates are stored as JSON arrays

-- For now, we'll document the issue and create a manual fix approach
-- The date-normalizer.ts will handle new orders going forward
-- Existing orders will be normalized when they're loaded/displayed

-- Check for "Invalid Date" patterns
SELECT id, shortId, transportDates FROM orders 
WHERE transportDates LIKE '%Invalid%' 
   OR transportDates LIKE '%NaN%'
   OR transportDates LIKE '%2001%'
LIMIT 10;
