import { useEditor } from "@/contexts/EditorContext";
import { useRef, useState } from "react";
import { Upload, ImageIcon, Link, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  id: string;
  fallback: string;
  alt: string;
  className?: string;
}

export default function EditableImage({ id, fallback, alt, className }: Props) {
  const { editMode, getContent, uploadImage, saveContent } = useEditor();
  const src = getContent(id, fallback);
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    await uploadImage(f, id);
    setUploading(false);
    e.target.value = "";
  };

  const handleUrlSave = async () => {
    if (!urlInput.trim()) return;
    await saveContent(id, urlInput.trim());
    setUrlInput("");
    setPopoverOpen(false);
  };

  return (
    <div className={cn("relative inline-block group/img", editMode && "outline-dashed outline-2 outline-primary/60 rounded-lg")}>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
      />
      {editMode && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover/img:opacity-100 transition-smooth" />
      )}
      {editMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-smooth">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-elegant"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-elegant"
              >
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Paste image URL</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSave()}
                    className="text-sm h-8"
                  />
                  <Button size="sm" onClick={handleUrlSave} className="h-8 shrink-0">
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-elegant"
            onClick={async () => {
              await saveContent(id, fallback);
            }}
            title="Reset to default"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
