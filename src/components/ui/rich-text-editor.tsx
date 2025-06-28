
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  readOnly = false,
}) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean'],
      ['undo', 'redo']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link',
    'color', 'background'
  ];

  // Process content to replace empty paragraphs with line breaks
  const handleContentChange = (content: string) => {
    // Replace empty paragraphs with line breaks
    const processedContent = content
      .replace(/<p><br><\/p>/g, '<br>')
      .replace(/<p><\/p>/g, '<br>')
      .replace(/<p>\s*<\/p>/g, '<br>');
    
    onChange(processedContent);
  };

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.375rem',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
