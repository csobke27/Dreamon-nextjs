import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import FileLogPageClient from "./page-client";

export const metadata = {
  title: "Dreamon | File-Share Log",
};

export default async function FileLogPage() {
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

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: log } = await supabase.rpc("admin_file_log");

  return <FileLogPageClient entries={log ?? []} />;
}
