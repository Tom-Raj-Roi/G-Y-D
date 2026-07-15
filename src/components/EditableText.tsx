import { useEditor } from "@/contexts/EditorContext";
import { useState, useRef, useEffect, CSSProperties } from "react";
import { Pencil, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  fallback: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
  style?: CSSProperties;
}

export default function EditableText({ id, fallback, as: Tag = "span", className, multiline, style }: Props) {
  const { editMode, getContent, getStyles, saveContent } = useEditor();
  const value = getContent(id, fallback);
  const dbStyles = getStyles(id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  const styleFromDb: CSSProperties = {
    fontFamily: dbStyles.fontFamily,
    fontSize: dbStyles.fontSize,
    fontWeight: dbStyles.fontWeight as CSSProperties["fontWeight"],
    color: dbStyles.color,
    fontStyle: dbStyles.fontStyle as CSSProperties["fontStyle"],
    textDecoration: dbStyles.textDecoration as CSSProperties["textDecoration"],
    textAlign: dbStyles.textAlign as CSSProperties["textAlign"],
    lineHeight: dbStyles.lineHeight,
    letterSpacing: dbStyles.letterSpacing,
    ...style,
  };

  const toggleStyle = (key: string, onValue: string, offValue: string = "") => {
    const current = dbStyles[key] || offValue;
    const next = current === onValue ? offValue : onValue;
    saveContent(id, draft, { ...dbStyles, [key]: next });
  };

  const updateStyle = (key: string, value: string) => {
    saveContent(id, draft, { ...dbStyles, [key]: value });
  };

  if (editing) {
    const Field = multiline ? "textarea" : "input";
    return (
      <div className="inline-block w-full">
        <Field
          ref={ref as never}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full bg-background border-2 border-primary rounded-md px-2 py-1 text-sm"
          rows={multiline ? 4 : undefined}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
            if (e.key === "Enter" && !multiline && !e.shiftKey) {
              e.preventDefault();
              saveContent(id, draft, dbStyles);
              setEditing(false);
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-1 mt-1.5 p-1.5 bg-muted/50 rounded-md border">
          <Button size="icon" variant="ghost" className={cn("h-7 w-7", dbStyles.fontWeight === "bold" && "bg-primary/20")}
            onClick={() => toggleStyle("fontWeight", "bold", "normal")} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className={cn("h-7 w-7", dbStyles.fontStyle === "italic" && "bg-primary/20")}
            onClick={() => toggleStyle("fontStyle", "italic", "normal")} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className={cn("h-7 w-7", dbStyles.textDecoration === "underline" && "bg-primary/20")}
            onClick={() => toggleStyle("textDecoration", "underline", "none")} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button size="icon" variant="ghost" className={cn("h-7 w-7", (dbStyles.textAlign || "left") === "left" && "bg-primary/20")}
            onClick={() => updateStyle("textAlign", "left")} title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className={cn("h-7 w-7", dbStyles.textAlign === "center" && "bg-primary/20")}
            onClick={() => updateStyle("textAlign", "center")} title="Align center">
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className={cn("h-7 w-7", dbStyles.textAlign === "right" && "bg-primary/20")}
            onClick={() => updateStyle("textAlign", "right")} title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <select
            className="text-xs border rounded px-1 h-7 bg-background"
            value={dbStyles.fontSize || ""}
            onChange={(e) => updateStyle("fontSize", e.target.value)}>
            <option value="">Size</option>
            {["12px","14px","16px","18px","20px","24px","28px","32px","40px","48px","60px","72px"].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="text-xs border rounded px-1 h-7 bg-background"
            value={dbStyles.fontFamily || ""}
            onChange={(e) => updateStyle("fontFamily", e.target.value)}>
            <option value="">Font</option>
            <option value="Inter, sans-serif">Inter</option>
            <option value="'Playfair Display', serif">Playfair</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier</option>
            <option value="Arial, sans-serif">Arial</option>
          </select>
          <select
            className="text-xs border rounded px-1 h-7 bg-background"
            value={dbStyles.lineHeight || ""}
            onChange={(e) => updateStyle("lineHeight", e.target.value)}>
            <option value="">Height</option>
            <option value="1">1</option>
            <option value="1.2">1.2</option>
            <option value="1.5">1.5</option>
            <option value="1.8">1.8</option>
            <option value="2">2</option>
          </select>
          <input type="color" value={dbStyles.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
            className="w-7 h-7 rounded border cursor-pointer" title="Text color" />

          <div className="w-px h-5 bg-border mx-1" />

          <button
            onClick={async () => { await saveContent(id, draft, dbStyles); setEditing(false); }}
            className="px-2.5 py-1 text-xs bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90">Save</button>
          <button onClick={() => { setDraft(value); setEditing(false); }}
            className="px-2.5 py-1 text-xs bg-muted rounded font-medium hover:bg-muted/80">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={cn(className, editMode && "outline-dashed outline-2 outline-primary/40 cursor-pointer relative group/editable")}
      style={styleFromDb}
      onClick={editMode ? () => setEditing(true) : undefined}
    >
      {value}
      {editMode && <Pencil className="inline ml-1 h-3 w-3 text-primary opacity-0 group-hover/editable:opacity-100 transition-opacity" />}
    </Tag>
  );
}
