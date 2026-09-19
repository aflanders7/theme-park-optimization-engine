import type { JSX, ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(!?\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const key = `${match.index}-${token}`;
    const linkMatch = token.match(/^(!?)\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      const [, bang, label, href] = linkMatch;
      if (bang) {
        nodes.push(<img key={key} src={href} alt={label} />);
      } else {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a key={key} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
            {label}
          </a>
        );
      }
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const rendered: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      rendered.push(<hr key={i} />);
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const id = slugify(text);
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      rendered.push(<HeadingTag key={i} id={id}>{parseInline(text)}</HeadingTag>);
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      rendered.push(<blockquote key={i}>{quoteLines.map((quoteLine) => <p key={quoteLine}>{parseInline(quoteLine)}</p>)}</blockquote>);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      rendered.push(<ul key={i}>{items.map((item) => <li key={item}>{parseInline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      rendered.push(<ol key={i}>{items.map((item) => <li key={item}>{parseInline(item)}</li>)}</ol>);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      rendered.push(<img key={i} src={image[2]} alt={image[1]} />);
      i += 1;
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s+/.test(lines[i].trim()) && !/^([-*]|\d+\.)\s+/.test(lines[i].trim()) && !lines[i].trim().startsWith('> ')) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    rendered.push(<p key={i}>{parseInline(paragraphLines.join(' '))}</p>);
  }

  return <div className="blog-prose">{rendered}</div>;
}
