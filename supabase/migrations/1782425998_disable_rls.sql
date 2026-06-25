-- Désactiver RLS policies pour que le compte fonctionne complètement
ALTER TABLE public.judokas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs DISABLE ROW LEVEL SECURITY;
