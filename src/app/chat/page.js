import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import ChatPageClient from "./page-client";

export const metadata = {
  title: "Dreamon | Chat",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const allowedRoles = ["admin", "dev", "tester"];
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/");
  }

  return <ChatPageClient userId={data.user.id} role={profile.role} />;
}
