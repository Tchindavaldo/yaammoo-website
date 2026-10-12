// Icones d'interface du site, en SVG inline (heritent de currentColor).
// Remplacent les emojis decoratifs (R15). Traces au trait inspires de Lucide
// (licence ISC) ; "apple" est le pictogramme plein du bouton App Store.

const STROKE = {
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  cash: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
};

const APPLE =
  "M16.37 12.6c-.02-2.53 2.07-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.04.92-3.83.92-.79 0-2.01-.9-3.3-.87-1.7.02-3.27.99-4.14 2.51-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.84 2.59 3.15 2.54 1.27-.05 1.75-.82 3.28-.82 1.53 0 1.96.82 3.3.79 1.36-.02 2.22-1.24 3.05-2.47.96-1.41 1.36-2.78 1.38-2.85-.03-.01-2.64-1.01-2.66-4.06ZM13.85 5.17c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.23.67-2.95 1.52-.65.75-1.22 1.95-1.06 3.1 1.12.09 2.27-.57 2.97-1.42Z";

export default function Icon({ name, size = 24 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" };
  if (name === "apple") {
    return (
      <svg {...common} fill="currentColor">
        <path d={APPLE} />
      </svg>
    );
  }
  return (
    <svg
      {...common}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {STROKE[name]}
    </svg>
  );
}
