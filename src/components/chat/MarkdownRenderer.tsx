import { memo } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`list-${listKey++}`} className="list-disc pl-5 space-y-1 my-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{renderInline(item)}</li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`list-${listKey++}`} className="list-decimal pl-5 space-y-1 my-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm">{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-semibold mt-3 mb-1">
            {renderInline(trimmed.slice(4))}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-semibold mt-4 mb-2">
            {renderInline(trimmed.slice(3))}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-bold mt-4 mb-2">
            {renderInline(trimmed.slice(2))}
          </h1>
        );
        continue;
      }

      // Unordered list items
      const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      // Ordered list items
      const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(olMatch[2]);
        continue;
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        flushList();
        const endIndex = lines.findIndex((l, j) => j > i && l.trim().startsWith('```'));
        if (endIndex !== -1) {
          const code = lines.slice(i + 1, endIndex).join('\n');
          elements.push(
            <pre key={`code-${i}`} className="bg-muted/50 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-xs font-mono">{code}</code>
            </pre>
          );
          i = endIndex;
          continue;
        }
      }

      // Inline code
      if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
        flushList();
        elements.push(
          <code key={`inline-${i}`} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {trimmed.slice(1, -1)}
          </code>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        flushList();
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
            {renderInline(trimmed.slice(1).trim())}
          </blockquote>
        );
        continue;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-3 border-border" />);
        continue;
      }

      // Empty line
      if (trimmed === '') {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed my-1">
          {renderInline(trimmed)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Handle bold, italic, and inline code
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.+?)(\2)(.*)/s);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(renderInline(boldMatch[1]));
        parts.push(<strong key={`bold-${key++}`}>{boldMatch[3]}</strong>);
        remaining = boldMatch[5];
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(.*?)(\*|_)(.+?)(\2)(.*)/s);
      if (italicMatch && !italicMatch[1].endsWith('*')) {
        if (italicMatch[1]) parts.push(renderInline(italicMatch[1]));
        parts.push(<em key={`italic-${key++}`}>{italicMatch[3]}</em>);
        remaining = italicMatch[5];
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(
          <code key={`code-${key++}`} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  return <div className="prose prose-sm max-w-none">{renderContent(content)}</div>;
});
