import { type ReactNode } from 'react';
import { parseMarkdown, type MarkdownInline } from '@/lib/markdown';

function renderInline(nodes: MarkdownInline[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (node.type) {
      case 'text':
        return node.value;
      case 'strong':
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case 'em':
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case 'strongEm':
        return (
          <strong key={key}>
            <em>{renderInline(node.children, key)}</em>
          </strong>
        );
      case 'link':
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
          >
            {renderInline(node.children, key)}
          </a>
        );
    }
  });
}

interface MarkdownTextProps {
  content?: string | null;
  className?: string;
}

/**
 * Renders the shared Markdown AST as React elements. No HTML is injected, so
 * user content is always escaped by React.
 */
export default function MarkdownText({ content, className }: MarkdownTextProps) {
  if (!content || !content.trim()) return null;

  const blocks = parseMarkdown(content);

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => (
        <p key={blockIndex} className={blockIndex < blocks.length - 1 ? 'mb-3' : undefined}>
          {block.lines.map((line, lineIndex) => {
            const content = renderInline(line.children, `b${blockIndex}l${lineIndex}`);

            return line.bullet ? (
              <span key={lineIndex} className="flex gap-2">
                <span aria-hidden="true" className="text-emerald-600">
                  •
                </span>
                <span className="min-w-0 flex-1">{content}</span>
              </span>
            ) : (
              <span key={lineIndex} className="block">
                {content}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
