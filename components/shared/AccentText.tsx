import { Fragment } from 'react';
import { ACCENT_PATTERN } from '@/types/content';

// Renders admin-authored heading text, turning `[[...]]` runs into the
// section's accent span.
//
// The alternative — storing raw HTML — would mean every heading field is an
// injection point and a chance to break the layout with an unclosed tag. This
// keeps the stored value plain text: the worst a bad edit can do is show
// literal brackets.

type Props = {
  text: string;
  /** Classes for the accented run. Each section supplies its own colour. */
  accentClassName?: string;
};

export function AccentText({ text, accentClassName }: Props) {
  // No marker (the common case) — return the string untouched, no wrappers.
  if (!text.includes('[[')) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Fresh regex per call: ACCENT_PATTERN is global, so a shared instance would
  // carry lastIndex between renders and drop matches.
  const pattern = new RegExp(ACCENT_PATTERN.source, 'g');

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <span key={match.index} className={accentClassName}>
        {match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  );
}
