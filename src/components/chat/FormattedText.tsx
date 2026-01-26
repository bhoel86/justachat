import { useState } from "react";
import { decodeFormat, TextFormat } from "./TextFormatMenu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface FormattedTextProps {
  text: string;
  className?: string;
}

// Rainbow colors for individual characters
const rainbowColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'
];

// IRC color palette (16 standard colors)
const IRC_COLORS: { [key: string]: string } = {
  '00': '#FFFFFF', // white
  '01': '#000000', // black
  '02': '#00007F', // navy
  '03': '#009300', // green
  '04': '#FF0000', // red
  '05': '#7F0000', // brown
  '06': '#9C009C', // purple
  '07': '#FC7F00', // orange
  '08': '#FFFF00', // yellow
  '09': '#00FC00', // lime
  '10': '#009393', // teal
  '11': '#00FFFF', // cyan
  '12': '#0000FC', // blue
  '13': '#FF00FF', // pink
  '14': '#7F7F7F', // grey
  '15': '#D2D2D2', // light grey
};

// Parse IRC color codes (\x03FG or \x03FG,BG)
const parseIrcColors = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const colorRegex = /\x03(\d{1,2})(?:,(\d{1,2}))?/g;
  
  let lastIndex = 0;
  let match;
  let currentFg: string | null = null;
  let currentBg: string | null = null;
  
  // Split by color codes and newlines
  const segments = text.split(/(\x03\d{1,2}(?:,\d{1,2})?|\x03|\n)/);
  
  segments.forEach((segment, i) => {
    if (!segment) return;
    
    if (segment === '\n') {
      parts.push(<br key={`br-${i}`} />);
      return;
    }
    
    if (segment === '\x03') {
      // Reset colors
      currentFg = null;
      currentBg = null;
      return;
    }
    
    const colorMatch = segment.match(/^\x03(\d{1,2})(?:,(\d{1,2}))?$/);
    if (colorMatch) {
      const fg = colorMatch[1].padStart(2, '0');
      const bg = colorMatch[2]?.padStart(2, '0');
      currentFg = IRC_COLORS[fg] || null;
      currentBg = bg ? IRC_COLORS[bg] : null;
      return;
    }
    
    // Regular text - apply current colors
    if (currentFg || currentBg) {
      parts.push(
        <span
          key={`text-${i}`}
          style={{
            color: currentFg || undefined,
            backgroundColor: currentBg || undefined,
          }}
        >
          {segment}
        </span>
      );
    } else {
      parts.push(<span key={`text-${i}`}>{segment}</span>);
    }
  });
  
  return parts;
};

// Check if text contains IRC color codes
const hasIrcColors = (text: string): boolean => {
  return text.includes('\x03');
};

// Extract image URL from [img:url] format
const extractImage = (text: string): { hasImage: boolean; imageUrl: string | null; textContent: string } => {
  const imgMatch = text.match(/\[img:(https?:\/\/[^\]]+)\]/);
  if (imgMatch) {
    return {
      hasImage: true,
      imageUrl: imgMatch[1],
      textContent: text.replace(imgMatch[0], '').trim(),
    };
  }
  return { hasImage: false, imageUrl: null, textContent: text };
};

const ImagePreview = ({ url }: { url: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img
          src={url}
          alt="Chat image"
          className="max-w-[150px] sm:max-w-[200px] max-h-24 sm:max-h-32 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-contain mt-1"
          onClick={() => setIsOpen(true)}
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
        <img
          src={url}
          alt="Chat image full size"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
};

// Parse @mentions in text
const parseMentions = (content: string): (string | { type: 'mention'; username: string })[] => {
  const mentionRegex = /@(\w+)/g;
  const parts: (string | { type: 'mention'; username: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: 'mention', username: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
};

const MentionSpan = ({ username }: { username: string }) => (
  <span className="text-red-500 font-semibold bg-red-500/10 px-1 rounded cursor-pointer hover:bg-red-500/20 transition-colors">
    @{username}
  </span>
);

const FormattedText = ({ text, className = '' }: FormattedTextProps) => {
  // First check for images
  const { hasImage, imageUrl, textContent } = extractImage(text);
  
  // If there's no text content, just show the image
  if (hasImage && !textContent) {
    return imageUrl ? <ImagePreview url={imageUrl} /> : null;
  }
  
  const decoded = decodeFormat(textContent);
  
  const renderTextWithMentions = (content: string, additionalClassName?: string) => {
    const parts = parseMentions(content);
    return (
      <span className={additionalClassName}>
        {parts.map((part, i) =>
          typeof part === 'string' ? (
            <span key={i}>{part}</span>
          ) : (
            <MentionSpan key={i} username={part.username} />
          )
        )}
      </span>
    );
  };
  
  const renderText = () => {
    // Check for IRC color codes first (colored block art)
    if (hasIrcColors(textContent)) {
      return (
        <pre className={`font-mono text-[8px] leading-[8px] whitespace-pre ${className}`}>
          {parseIrcColors(textContent)}
        </pre>
      );
    }
    
    if (!decoded) {
      return renderTextWithMentions(textContent, className);
    }
    
    const { format, text: content } = decoded;
    
    // Wrapper for background color
    const BgWrapper = ({ children }: { children: React.ReactNode }) => {
      if (format.bgColor) {
        return (
          <span 
            className="px-1.5 py-0.5 rounded inline-block"
            style={{ backgroundColor: format.bgColor }}
          >
            {children}
          </span>
        );
      }
      return <>{children}</>;
    };
    
    switch (format.textStyle) {
      case 'rainbow':
        // Rainbow with mentions - parse mentions first, then apply rainbow to non-mention parts
        const rainbowParts = parseMentions(content);
        let charIndex = 0;
        return (
          <BgWrapper>
            <span className={className}>
              {rainbowParts.map((part, partIdx) => {
                if (typeof part !== 'string') {
                  return <MentionSpan key={partIdx} username={part.username} />;
                }
                return part.split('').map((char, i) => {
                  const idx = charIndex++;
                  return (
                    <span
                      key={`${partIdx}-${i}`}
                      style={{
                        color: rainbowColors[idx % rainbowColors.length],
                        fontWeight: 500,
                      }}
                    >
                      {char}
                    </span>
                  );
                });
              })}
            </span>
          </BgWrapper>
        );
      
      case 'gradient':
        // For gradient, show mentions differently since gradient clips
        const gradientParts = parseMentions(content);
        const hasMentions = gradientParts.some(p => typeof p !== 'string');
        if (hasMentions) {
          return (
            <BgWrapper>
              <span className={className}>
                {gradientParts.map((part, i) =>
                  typeof part === 'string' ? (
                    <span
                      key={i}
                      className="bg-clip-text text-transparent font-medium"
                      style={{ backgroundImage: format.textValue }}
                    >
                      {part}
                    </span>
                  ) : (
                    <MentionSpan key={i} username={part.username} />
                  )
                )}
              </span>
            </BgWrapper>
          );
        }
        return (
          <BgWrapper>
            <span
              className={`bg-clip-text text-transparent font-medium ${className}`}
              style={{ backgroundImage: format.textValue }}
            >
              {content}
            </span>
          </BgWrapper>
        );
      
      case 'color':
        const colorParts = parseMentions(content);
        return (
          <BgWrapper>
            <span className={className}>
              {colorParts.map((part, i) =>
                typeof part === 'string' ? (
                  <span 
                    key={i}
                    className="font-medium" 
                    style={{ color: format.textValue }}
                  >
                    {part}
                  </span>
                ) : (
                  <MentionSpan key={i} username={part.username} />
                )
              )}
            </span>
          </BgWrapper>
        );
      
      default:
        if (format.bgColor) {
          return (
            <span 
              className={`px-1.5 py-0.5 rounded inline-block ${className}`}
              style={{ backgroundColor: format.bgColor }}
            >
              {renderTextWithMentions(content)}
            </span>
          );
        }
        return renderTextWithMentions(content, className);
    }
  };
  
  return (
    <div className="inline">
      {renderText()}
      {hasImage && imageUrl && (
        <div className="block">
          <ImagePreview url={imageUrl} />
        </div>
      )}
    </div>
  );
};

export default FormattedText;
