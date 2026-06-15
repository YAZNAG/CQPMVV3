-- Harmonise highlight band colors with logo navy palette
UPDATE "home_highlights"
SET "backgroundColor" = '#0a1929'
WHERE "titleFr" = 'Centre De Mdiq' AND "backgroundColor" IN ('#5c4d8a', '#2563eb');

UPDATE "home_highlights"
SET "backgroundColor" = '#0d2c54'
WHERE "titleFr" = 'ITPM de Larache' AND "backgroundColor" IN ('#1e6eb8', '#2563eb');

UPDATE "home_highlights"
SET "backgroundColor" = '#2b6792'
WHERE "titleFr" = 'Centre De Mehdia' AND "backgroundColor" IN ('#e8751a', '#2563eb');
