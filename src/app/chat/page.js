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

  if (!profile || (profile.role !== "admin" && profile.role !== "dev")) {
    redirect("/");
  }

  return <ChatPageClient userId={data.user.id} />;
}
