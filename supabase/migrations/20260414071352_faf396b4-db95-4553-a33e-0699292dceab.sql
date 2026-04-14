
-- 1. Fix project_comments email exposure: revoke direct SELECT on email from anon/public
-- Use column-level grants instead
REVOKE SELECT ON public.project_comments FROM anon;
REVOKE SELECT ON public.project_comments FROM public;
GRANT SELECT (id, project_id, name, comment, created_at, is_approved) ON public.project_comments TO anon;
GRANT SELECT (id, project_id, name, comment, created_at, is_approved) ON public.project_comments TO public;

-- 2. Fix user_roles privilege escalation: add explicit restrictive INSERT/UPDATE/DELETE policies
-- The ALL policy should already cover this, but add explicit restrictive policy for safety
CREATE POLICY "Only admins can insert user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix newsletter_subscribers: replace overly permissive INSERT with email validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL 
  AND length(email) <= 255 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND is_active = true
);

-- 4. Fix contact_messages: replace overly permissive INSERT with validation
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL 
  AND length(name) <= 200
  AND email IS NOT NULL
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(message) <= 5000
  AND is_read = false
);

-- 5. Fix project_comments: replace overly permissive INSERT with validation
DROP POLICY IF EXISTS "Anyone can add comments" ON public.project_comments;
CREATE POLICY "Anyone can add comments"
ON public.project_comments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(name) <= 200
  AND email IS NOT NULL
  AND length(email) <= 255
  AND length(comment) <= 5000
  AND is_approved = false
);
