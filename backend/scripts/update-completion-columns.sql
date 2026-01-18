-- Update existing "Concluído" or "Conclusão" columns to be completion columns
UPDATE "KanbanColumn" 
SET "isCompletionColumn" = true 
WHERE LOWER(title) = 'conclusão' OR LOWER(title) = 'concluído';
