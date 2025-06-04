import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { View, Heading, Divider } from '@adobe/react-spectrum';

interface ReleaseNotesPreviewProps {
  releaseNotes: string;
}

// Function to preprocess release notes
function preprocessReleaseNotes(markdown: string): string {
  // Remove HTML comments
  let processed = markdown.replace(/<!--[\s\S]*?-->/g, '').trim();

  // Convert @username mentions to clickable links
  processed = processed.replace(
    /@([a-zA-Z0-9_-]+)/g,
    '[@$1](https://github.com/$1)'
  );

  return processed;
}

// Function to shorten GitHub URLs for display
function shortenGitHubUrl(href: string, children: any): string {
  // Convert PR URLs to #123 format
  const prMatch = href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)/);
  if (prMatch) {
    return `#${prMatch[1]}`;
  }

  // Convert compare URLs to short format
  const compareMatch = href.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/compare\/(.+)$/);
  if (compareMatch) {
    return compareMatch[1];
  }

  // For other URLs, return original children
  return children;
}

export function ReleaseNotesPreview({ releaseNotes }: ReleaseNotesPreviewProps) {
  if (!releaseNotes) return null;

  return (
    <View>
      <Heading level={2}>Release Notes Preview</Heading>
      <Divider />

      <View
        maxHeight="size-6000"
        overflow="auto"
      >
        <div style={{
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#444',
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({children}) => <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{children}</h1>,
              h2: ({children}) => <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{children}</h2>,
              h3: ({children}) => <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{children}</h3>,
              p: ({children}) => <p style={{ marginBottom: '8px' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginBottom: '8px', paddingLeft: '20px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '4px' }}>{children}</li>,
              a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>{href ? shortenGitHubUrl(href, children) : children}</a>,
              code: ({children}) => <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>{children}</code>,
              strong: ({children}) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
            }}
          >
            {preprocessReleaseNotes(releaseNotes)}
          </ReactMarkdown>
        </div>
      </View>
    </View>
  );
}
