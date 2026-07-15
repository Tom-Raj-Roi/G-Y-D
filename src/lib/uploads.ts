import { supabase } from "@/integrations/supabase/client";

export async function uploadApplicationFile(file: File, prefix: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("applications").upload(path, file, { upsert: false });
  if (error) {
    console.error("upload error", error);
    return null;
  }
  return path;
}
