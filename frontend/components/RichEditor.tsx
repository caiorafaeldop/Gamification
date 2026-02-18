import React, { useRef, useState, useEffect } from 'react';

// Função para formatar link
export const formatLink = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Função para converter texto com URLs de imagem para HTML
export const textToHtmlWithImages = (text: string): string => {
  if (!text) return '';
  const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s]*)?)/gi;
  // Primeiro substituir imagens, depois converter quebras de linha para <br>
  let html = text.replace(imageRegex, '<img src="$1" alt="imagem" style="max-width:100%;max-height:200px;border-radius:8px;margin:4px 0;display:block;" />');
  // Converter \n para <br> para preservar quebras de linha
  html = html.replace(/\n/g, '<br>');
  return html;
};

// Função para converter HTML de volta para texto
export const htmlToText = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Substituir imagens pelo URL
  div.querySelectorAll('img').forEach(img => {
    const textNode = document.createTextNode(img.src + '\n');
    img.replaceWith(textNode);
  });
  
  // Preservar quebras de linha: converter <br> e </div> para \n
  div.querySelectorAll('br').forEach(br => {
    br.replaceWith(document.createTextNode('\n'));
  });
  
  // Divs criam novas linhas no contenteditable
  div.querySelectorAll('div').forEach(d => {
    if (d.textContent) {
      const text = document.createTextNode('\n' + d.textContent);
      d.replaceWith(text);
    }
  });
  
  return div.textContent || div.innerText || '';
};

// Rich Editor com inserção na posição do cursor
interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
  placeholder: string;
  className?: string;
  minHeight?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, onBlur, onImageUpload, placeholder, className = '', minHeight = '80px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused) {
      editorRef.current.innerHTML = textToHtmlWithImages(value);
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      const text = htmlToText(editorRef.current.innerHTML);
      onChange(text);
    }
  };

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = textToHtmlWithImages(value);
    }
    onBlur?.();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;
        
        // Inserir placeholder na posição atual
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        const placeholderSpan = document.createElement('span');
        placeholderSpan.textContent = '⏳ Enviando imagem...';
        placeholderSpan.style.color = '#3b82f6';
        placeholderSpan.style.fontStyle = 'italic';
        
        if (range) {
          range.deleteContents();
          range.insertNode(placeholderSpan);
          range.setStartAfter(placeholderSpan);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        // Upload e substituir placeholder
        const imageUrl = await onImageUpload(file);
        
        if (imageUrl && placeholderSpan.parentNode) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'imagem';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '200px';
          img.style.borderRadius = '8px';
          img.style.margin = '4px 0';
          img.style.display = 'block';
          
          placeholderSpan.replaceWith(img);
          
          // Atualizar o valor
          if (editorRef.current) {
            const text = htmlToText(editorRef.current.innerHTML);
            onChange(text);
          }
        } else if (placeholderSpan.parentNode) {
          placeholderSpan.textContent = '❌ Erro ao enviar';
          setTimeout(() => placeholderSpan.remove(), 2000);
        }
        
        break;
      }
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPaste={handlePaste}
      onKeyDown={(e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          if (range) {
            range.deleteContents();
            const tabNode = document.createTextNode('\t');
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode); 
            selection?.removeAllRanges();
            selection?.addRange(range);
            handleInput();
          }
        }
      }}
      data-placeholder={placeholder}
      className={`outline-none whitespace-pre-wrap ${className} ${!value ? 'empty-placeholder' : ''}`}
      style={{ minHeight }}
    />
  );
};
