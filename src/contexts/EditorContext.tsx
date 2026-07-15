import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type ContentMap = Record<string, { value: string; styles: Record<string, string> }>;

type EditorCtx = {
  editMode: boolean;
  toggleEditMode: () => void;
  content: ContentMap;
  getContent: (id: string, fallback: string) => string;
  getStyles: (id: string) => Record<string, string>;
  saveContent: (id: string, value: string, styles?: Record<string, string>) => Promise<void>;
  uploadImage: (file: File, id: string) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<EditorCtx>({} as EditorCtx);

export function EditorProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState<ContentMap>({});

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("site_content").select("*");
    if (data) {
      const map: ContentMap = {};
      data.forEach((row) => {
        map[row.id] = { value: row.value || "", styles: (row.styles as Record<string, string>) || {} };
      });
      setContent(map);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (!isAdmin) setEditMode(false); }, [isAdmin]);

  const getContent = (id: string, fallback: string) => content[id]?.value || fallback;
  const getStyles = (id: string) => content[id]?.styles || {};

  const saveContent = async (id: string, value: string, styles?: Record<string, string>) => {
    const payload = { id, value, content_type: "text", styles: styles ?? content[id]?.styles ?? {} };
    const { error } = await supabase.from("site_content").upsert(payload);
    if (!error) await refresh();
  };

  const uploadImage = async (file: File, id: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    await supabase.from("site_content").upsert({ id, value: data.publicUrl, content_type: "image", styles: {} });
    await refresh();
    return data.publicUrl;
  };

  return (
    <Ctx.Provider value={{
      editMode, toggleEditMode: () => setEditMode((v) => !v),
      content, getContent, getStyles, saveContent, uploadImage, refresh,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useEditor = () => useContext(Ctx);
