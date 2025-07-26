import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

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

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="wysiwyg-editor">
      <Editor
        apiKey="no-api-key" // Using TinyMCE without cloud - self-hosted
        onInit={(_evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks | bold italic forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | ' +
            'link image | code preview | help',
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
            img {
              max-width: 100%;
              height: auto;
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
          valid_elements: 'p,br,strong,em,u,a[href|title],ul,ol,li,h1,h2,h3,h4,h5,h6,img[src|alt|width|height],table,thead,tbody,tr,th,td,blockquote,div',
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
          style_formats: [
            { title: 'Headers', items: [
              { title: 'Header 1', format: 'h1' },
              { title: 'Header 2', format: 'h2' },
              { title: 'Header 3', format: 'h3' }
            ]},
            { title: 'Inline', items: [
              { title: 'Bold', format: 'bold' },
              { title: 'Italic', format: 'italic' },
              { title: 'Underline', format: 'underline' },
              { title: 'Code', inline: 'code' }
            ]},
            { title: 'Blocks', items: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' }
            ]},
            { title: 'Alignment', items: [
              { title: 'Left', format: 'alignleft' },
              { title: 'Center', format: 'aligncenter' },
              { title: 'Right', format: 'alignright' },
              { title: 'Justify', format: 'alignjustify' }
            ]}
          ],
          // Link handling
          default_link_target: '_blank',
          link_title: false,
          target_list: false,
          // Image handling
          image_title: false,
          image_dimensions: false,
          image_class_list: [
            { title: 'Responsive', value: 'img-responsive' }
          ],
          // Paste handling for clean email content
          paste_as_text: false,
          paste_word_valid_elements: 'b,strong,i,em,u,s,a[href],ul,ol,li,p,br,h1,h2,h3,h4,h5,h6',
          paste_retain_style_properties: 'color background-color font-size font-family font-weight font-style text-align text-decoration',
          paste_remove_styles_if_webkit: false,
          // Accessibility
          a11y_advanced_options: true,
          // Performance
          resize: false,
          statusbar: false
        }}
      />
      
      <style>{`
        .wysiwyg-editor .tox-tinymce {
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
        }
        
        .wysiwyg-editor .tox-toolbar {
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted/50));
        }
        
        .wysiwyg-editor .tox-edit-area {
          background: hsl(var(--background));
        }
        
        .wysiwyg-editor .tox-edit-area iframe {
          background: hsl(var(--background)) !important;
        }
        
        .wysiwyg-editor .tox-toolbar__group {
          border-right: 1px solid hsl(var(--border));
        }
        
        .wysiwyg-editor .tox-tbtn {
          color: hsl(var(--foreground));
        }
        
        .wysiwyg-editor .tox-tbtn:hover {
          background: hsl(var(--muted));
        }
        
        .wysiwyg-editor .tox-tbtn--enabled {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .wysiwyg-editor .tox-listbox,
        .wysiwyg-editor .tox-listbox__select-label {
          color: hsl(var(--foreground));
        }
        
        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .wysiwyg-editor .tox-tinymce {
            border-color: hsl(var(--border));
          }
          
          .wysiwyg-editor .tox-toolbar {
            background: hsl(var(--muted/30));
          }
        }
      `}</style>
    </div>
  );
}