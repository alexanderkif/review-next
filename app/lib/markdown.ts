/**
 * Small, dependency-free Markdown parser shared by the web and PDF renderers.
 *
 * Supported syntax:
 * - *italic* / _italic_
 * - **bold** / __bold__
 * - ***bold italic*** / ___bold italic___
 * - [text](https://example.com)
 * - a single newline is a soft break; a blank line starts a new paragraph
 *
 * Explicit <br /> tags are intentionally NOT supported. Raw HTML is never
 * interpreted, so every value is rendered as text by the target renderer.
 *
 * Intraword underscores (`snake_case`) are protected without lookbehind, which
 * keeps the parser compatible with older Safari versions.
 */

export type MarkdownInline =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: MarkdownInline[] }
  | { type: 'em'; children: MarkdownInline[] }
  | { type: 'strongEm'; children: MarkdownInline[] }
  | { type: 'link'; href: string; children: MarkdownInline[] };

export interface MarkdownLine {
  /** A leading bullet marker was stripped; the renderer may draw its own bullet. */
  bullet: boolean;
  children: MarkdownInline[];
}

export interface MarkdownBlock {
  lines: MarkdownLine[];
}

const INLINE_SOURCE = [
  String.raw`\[(?<linkText>[^\]]+)\]\((?<linkUrl>[^)\s]+)\)`,
  String.raw`\*\*\*(?<tripleStarText>.+?)\*\*\*`,
  String.raw`(?<tripleUnderBoundary>^|[^\w])___(?<tripleUnderText>[^_]+?)___(?![\w])`,
  String.raw`\*\*(?<doubleStarText>.+?)\*\*`,
  String.raw`(?<doubleUnderBoundary>^|[^\w])__(?<doubleUnderText>[^_]+?)__(?![\w])`,
  String.raw`\*(?<singleStarText>[^\s*](?:[^*]*[^\s*])?)\*`,
  String.raw`(?<singleUnderBoundary>^|[^\w])_(?<singleUnderText>[^\s_](?:[^_]*[^\s_])?)_(?![\w])`,
].join('|');

/** Only http(s) and mailto links are allowed; everything else renders as text. */
export function safeHref(value: string | undefined): string | null {
  if (!value) return null;
  const href = value.trim();
  return /^(https?:\/\/|mailto:)/i.test(href) ? href : null;
}

function parseInline(text: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = [];
  const pattern = new RegExp(INLINE_SOURCE, 'gi');
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push({ type: 'text', value: text.slice(cursor, match.index) });
    }

    const groups = match.groups ?? {};
    const underscoreBoundary =
      groups.tripleUnderBoundary ?? groups.doubleUnderBoundary ?? groups.singleUnderBoundary;

    // Underscore alternatives consume the boundary character; put it back.
    if (underscoreBoundary) {
      nodes.push({ type: 'text', value: underscoreBoundary });
    }

    if (groups.linkText !== undefined) {
      const href = safeHref(groups.linkUrl);
      if (href) {
        nodes.push({ type: 'link', href, children: parseInline(groups.linkText) });
      } else {
        nodes.push(...parseInline(groups.linkText));
      }
    } else if (groups.tripleStarText !== undefined) {
      nodes.push({ type: 'strongEm', children: parseInline(groups.tripleStarText) });
    } else if (groups.tripleUnderText !== undefined) {
      nodes.push({ type: 'strongEm', children: parseInline(groups.tripleUnderText) });
    } else if (groups.doubleStarText !== undefined) {
      nodes.push({ type: 'strong', children: parseInline(groups.doubleStarText) });
    } else if (groups.doubleUnderText !== undefined) {
      nodes.push({ type: 'strong', children: parseInline(groups.doubleUnderText) });
    } else if (groups.singleStarText !== undefined) {
      nodes.push({ type: 'em', children: parseInline(groups.singleStarText) });
    } else if (groups.singleUnderText !== undefined) {
      nodes.push({ type: 'em', children: parseInline(groups.singleUnderText) });
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push({ type: 'text', value: text.slice(cursor) });
  }

  return nodes;
}

export function parseMarkdown(input: string | null | undefined): MarkdownBlock[] {
  if (!input) return [];

  return input
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => ({
      lines: block.split('\n').map((rawLine) => {
        const line = rawLine.replace(/[ \t]+$/, '');
        const bulletMatch = line.match(/^\s*[•]\s*/) ?? line.match(/^\s*[-*]\s+/);
        const content = bulletMatch ? line.slice(bulletMatch[0].length) : line;

        return { bullet: Boolean(bulletMatch), children: parseInline(content) };
      }),
    }));
}

/** Extracts the plain text from an inline tree (used for prompts and fallbacks). */
export function markdownToPlainText(nodes: MarkdownInline[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value;
      if (node.type === 'link') {
        const label = markdownToPlainText(node.children).trim();
        return label && label !== node.href ? `${label} (${node.href})` : node.href;
      }
      return markdownToPlainText(node.children);
    })
    .join('');
}
