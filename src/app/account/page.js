import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import AccountPageClient from "./page-client";

export const metadata = {
  title: "Dreamon | My Account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.error("profile fetch error", data.user.id, profileError);
  }

  return <AccountPageClient email={data.user.email} role={profile?.role ?? "user"} />;
}
