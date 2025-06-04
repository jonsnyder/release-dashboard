interface GitHubLabelProps {
  name: string;
  color: string;
}

// Function to determine text color based on background color for optimal contrast
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Calculate luminance (0.299*R + 0.587*G + 0.114*B)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white text for dark backgrounds, black text for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function GitHubLabel({ name, color }: GitHubLabelProps) {
  return (
    <span
      style={{
        backgroundColor: `#${color}`,
        color: getContrastColor(color),
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      {name}
    </span>
  );
}
