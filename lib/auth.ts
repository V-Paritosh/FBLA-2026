import { createServerSideClient } from "./supabase-server";

// ==========================================
// SERVER-SIDE ONLY
// Use this in: app/api/... and Server Components
// ==========================================

export async function getSupabaseUser() {
  const serverClient = await createServerSideClient();

  const {
    data: { user },
    error,
  } = await serverClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
