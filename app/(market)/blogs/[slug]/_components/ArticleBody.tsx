// Renders the post's raw WordPress HTML. The content is first-party (our own
// blog), so it's injected directly, inside a scoped `.blog-content` wrapper that
// supplies typographic defaults — the WP install ships no typography plugin here
// and the app has none, so these styles are what make headings/lists/quotes/
// images read as an article. Scoped to the wrapper so nothing leaks to the rest
// of the page.
export function ArticleBody({ html }: { html: string }) {
  return (
    <>
      <style>{`
        .blog-content { color: inherit; line-height: 1.75; font-size: 1.05rem; }
        .blog-content > *:first-child { margin-top: 0; }
        .blog-content p { margin: 1.15em 0; }
        .blog-content h2 { font-size: 1.6rem; font-weight: 800; line-height: 1.25; margin: 1.8em 0 0.6em; letter-spacing: -0.01em; }
        .blog-content h3 { font-size: 1.3rem; font-weight: 700; margin: 1.6em 0 0.5em; }
        .blog-content h4 { font-size: 1.1rem; font-weight: 700; margin: 1.4em 0 0.4em; }
        .blog-content a { color: #b3122b; text-decoration: underline; text-underline-offset: 2px; }
        .blog-content ul, .blog-content ol { margin: 1.15em 0; padding-left: 1.5em; }
        .blog-content ul { list-style: disc; }
        .blog-content ol { list-style: decimal; }
        .blog-content li { margin: 0.4em 0; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5em 0; }
        .blog-content figure { margin: 1.5em 0; }
        .blog-content figcaption { font-size: 0.85rem; color: #6b7280; text-align: center; margin-top: 0.5em; }
        .blog-content blockquote { border-left: 3px solid #b3122b; padding-left: 1em; margin: 1.5em 0; font-style: italic; color: #4b5563; }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.95rem; }
        .blog-content th, .blog-content td { border: 1px solid #e5e7eb; padding: 0.5em 0.75em; text-align: left; }
        .blog-content th { background: #f9fafb; font-weight: 700; }
        .blog-content pre { overflow-x: auto; background: #f4f4f5; padding: 1em; border-radius: 0.5rem; margin: 1.5em 0; }
        .blog-content iframe { max-width: 100%; margin: 1.5em 0; }
        @media (prefers-color-scheme: dark) {
          .blog-content a { color: #f87171; }
          .blog-content blockquote { color: #9ca3af; }
          .blog-content th, .blog-content td { border-color: #374151; }
          .blog-content th { background: #1f2937; }
          .blog-content figcaption { color: #9ca3af; }
          .blog-content pre { background: #1f2937; }
        }
      `}</style>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
