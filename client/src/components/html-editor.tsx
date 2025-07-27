import { useRef, useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image,
  Code,
  Undo,
  Redo,
  Type,
  Palette
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"visual" | "html">("visual");
  const [htmlContent, setHtmlContent] = useState(value || "");
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
      ALLOW_DATA_ATTR: false
    });
  };

  // Only update editor content when value changes externally (not from internal edits)
  useEffect(() => {
    if (editorRef.current && activeView === "visual" && !isInternalUpdate) {
      const sanitizedContent = sanitizeHtml(value || "");
      editorRef.current.innerHTML = sanitizedContent;
    }
    setIsInternalUpdate(false);
  }, [value, activeView]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      setIsInternalUpdate(true);
      onChange(content);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      // Basic URL validation to prevent javascript: and data: URLs
      const sanitizedUrl = url.trim();
      if (sanitizedUrl.match(/^https?:\/\//i) || sanitizedUrl.startsWith('/') || sanitizedUrl.startsWith('#')) {
        executeCommand("createLink", sanitizedUrl);
      } else {
        alert("Please enter a valid HTTP/HTTPS URL");
      }
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      // Basic URL validation to prevent javascript: and data: URLs
      const sanitizedUrl = url.trim();
      if (sanitizedUrl.match(/^https?:\/\//i) || sanitizedUrl.startsWith('/')) {
        executeCommand("insertImage", sanitizedUrl);
      } else {
        alert("Please enter a valid HTTP/HTTPS image URL");
      }
    }
  };

  const changeFontSize = (size: string) => {
    executeCommand("fontSize", size);
  };

  const changeFontFamily = (font: string) => {
    executeCommand("fontName", font);
  };

  const changeTextColor = () => {
    const color = prompt("Enter color (hex or name):");
    if (color) {
      // Basic color validation to prevent script injection
      const sanitizedColor = color.trim();
      if (sanitizedColor.match(/^#[0-9a-fA-F]{3,6}$/) || sanitizedColor.match(/^[a-zA-Z]+$/)) {
        executeCommand("foreColor", sanitizedColor);
      } else {
        alert("Please enter a valid color (hex like #ff0000 or name like red)");
      }
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    setIsInternalUpdate(true);
    onChange(newContent);
    if (editorRef.current && activeView === "visual") {
      const sanitizedContent = sanitizeHtml(newContent);
      editorRef.current.innerHTML = sanitizedContent;
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("undo")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("redo")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Font Family */}
        <Select onValueChange={changeFontFamily}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select onValueChange={changeFontSize}>
          <SelectTrigger className="w-16 h-8 text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">8pt</SelectItem>
            <SelectItem value="2">10pt</SelectItem>
            <SelectItem value="3">12pt</SelectItem>
            <SelectItem value="4">14pt</SelectItem>
            <SelectItem value="5">18pt</SelectItem>
            <SelectItem value="6">24pt</SelectItem>
            <SelectItem value="7">36pt</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("bold")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("italic")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("underline")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Color */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={changeTextColor}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Text Color"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyLeft")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyCenter")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("justifyRight")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("insertUnorderedList")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("insertOrderedList")}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Insert Options */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "visual" | "html")}>
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted/30">
          <TabsTrigger value="visual" className="text-sm">Visual Editor</TabsTrigger>
          <TabsTrigger value="html" className="text-sm">HTML Source</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="m-0">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 bg-background text-foreground outline-none focus:ring-0"
            style={{ minHeight: '300px' }}
            onInput={(e) => {
              // Use setTimeout to debounce and avoid cursor jumping
              setTimeout(() => updateContent(), 0);
            }}
            onBlur={updateContent}
            onKeyDown={(e) => {
              // Handle common keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                  case 'b':
                    e.preventDefault();
                    executeCommand('bold');
                    break;
                  case 'i':
                    e.preventDefault();
                    executeCommand('italic');
                    break;
                  case 'u':
                    e.preventDefault();
                    executeCommand('underline');
                    break;
                }
              }
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
            data-testid="html-editor-visual"
          />
        </TabsContent>

        <TabsContent value="html" className="m-0">
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="w-full min-h-[300px] p-4 bg-background text-foreground font-mono text-sm resize-none outline-none border-none"
            placeholder="Enter HTML code here..."
            data-testid="html-editor-source"
          />
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
        <span>{htmlContent.replace(/<[^>]*>/g, '').length} characters</span>
        <span>{activeView === "visual" ? "WYSIWYG Editor" : "HTML Source"}</span>
      </div>
    </div>
  );
}