-- Add UPDATE policy to user_quiz_scores table to prevent unauthorized score modifications
CREATE POLICY "Users can update their own quiz scores" 
ON public.user_quiz_scores 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);