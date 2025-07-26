import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState, useEffect } from 'react';

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

export default function WysiwygEditor({ 
  value, 
  onChange, 
  height = 400,
  placeholder = "Start writing your newsletter content..."
}: WysiwygEditorProps) {
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  useEffect(() => {
    // Set a timeout to detect if TinyMCE fails to load
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleInit = (_evt: any, editor: any) => {
    editorRef.current = editor;
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    // Fallback to a rich textarea with basic formatting
    return (
      <div className="wysiwyg-editor-fallback">
        <div className="mb-2 text-sm text-muted-foreground">
          Rich text editor loading... Using basic editor.
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={Math.floor(height / 20)}
          className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{ height: `${height}px` }}
        />
      </div>
    );
  }

  return (
    <div className="wysiwyg-editor">
      {isLoading && (
        <div className="flex items-center justify-center p-8 border border-border rounded-md bg-muted/30">
          <div className="text-sm text-muted-foreground">Loading rich text editor...</div>
        </div>
      )}
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        <Editor
          apiKey="no-api-key"
          onInit={handleInit}
          value={value}
          onEditorChange={handleEditorChange}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | bold italic forecolor | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | removeformat | ' +
              'link | code preview | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                color: #333;
                background-color: #fff;
                margin: 8px;
              }
              p { margin: 0 0 16px 0; }
              h1, h2, h3, h4, h5, h6 { 
                margin: 0 0 16px 0; 
                line-height: 1.4; 
                font-weight: 600;
              }
              ul, ol { 
                margin: 0 0 16px 0; 
                padding-left: 24px; 
              }
              li { margin-bottom: 4px; }
              a { 
                color: #ef4444; 
                text-decoration: underline; 
              }
              a:hover { 
                color: #dc2626; 
              }
              blockquote {
                border-left: 4px solid #ef4444;
                margin: 0 0 16px 0;
                padding: 8px 16px;
                background-color: #fef2f2;
                font-style: italic;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 0 0 16px 0;
              }
              table th,
              table td {
                border: 1px solid #e5e7eb;
                padding: 8px 12px;
                text-align: left;
              }
              table th {
                background-color: #f9fafb;
                font-weight: 600;
              }
            `,
            placeholder,
            browser_spellcheck: true,
            contextmenu: false,
            skin: 'oxide',
            content_css: false,
            // Email-specific optimizations
            forced_root_block: 'p',
            force_br_newlines: false,
            force_p_newlines: true,
            remove_trailing_brs: true,
            convert_urls: false,
            relative_urls: false,
            // Cleanup and formatting for email compatibility
            valid_elements: 'p,br,strong,em,u,a[href|title],ul,ol,li,h1,h2,h3,h4,h5,h6,table,thead,tbody,tr,th,td,blockquote,div',
            valid_styles: {
              '*': 'color,background-color,font-size,font-family,font-weight,font-style,text-align,text-decoration,margin,padding,border,border-radius'
            },
            // Inline styles for email compatibility
            formats: {
              bold: { inline: 'strong' },
              italic: { inline: 'em' },
              underline: { inline: 'u' },
              strikethrough: { inline: 'del' }
            },
            // Link handling
            default_link_target: '_blank',
            link_title: false,
            target_list: false,
            // Paste handling for clean email content
            paste_as_text: false,
            paste_word_valid_elements: 'b,strong,i,em,u,s,a[href],ul,ol,li,p,br,h1,h2,h3,h4,h5,h6',
            paste_retain_style_properties: 'color background-color font-size font-family font-weight font-style text-align text-decoration',
            paste_remove_styles_if_webkit: false,
            // Performance
            resize: false,
            statusbar: false
          }}
        />
      </div>
    </div>
  );
}