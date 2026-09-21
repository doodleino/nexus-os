---
name: supabase-auth-storage
description: Supabase Row Level Security (RLS) policies, OAuth & PKCE auth flows, storage buckets, and edge functions.
metadata:
  origin: NEXUS-OS
---

# Supabase Auth & Row Level Security (RLS)

Use this skill when architecting backend data models with PostgreSQL Row Level Security (RLS) and client-side Supabase integrations.

## Hardened RLS Policy Template

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to read only projects they own or collaborate on
CREATE POLICY "Users can view assigned projects"
ON projects FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);
```
