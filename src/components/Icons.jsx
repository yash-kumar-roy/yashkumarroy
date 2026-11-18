const base = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: 'false' };

export const GitHubIcon = (p) => (
  <svg {...base} {...p} fill="currentColor">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const LinkedInIcon = (p) => (
  <svg {...base} {...p} fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

export const KaggleIcon = (p) => (
  <svg {...base} {...p} fill="currentColor">
    <path d="M18.83 23.6c-.02.27-.15.4-.4.4h-3.02a.6.6 0 0 1-.52-.26L9.9 17.37l-1.4 1.34v4.52c0 .5-.25.77-.75.77H5.42c-.5 0-.75-.26-.75-.77V.77c0-.51.25-.77.75-.77h2.33c.5 0 .75.26.75.77v13.88l5.98-6.05c.17-.17.34-.26.52-.26h3.12c.23 0 .37.1.42.29.05.22.02.38-.08.47l-6.33 6.13 6.6 8.03c.08.09.1.2.1.34Z" />
  </svg>
);

export const InstagramIcon = (p) => (
  <svg {...base} {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

export const ExternalIcon = (p) => (
  <svg {...base} width="14" height="14" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const PlayIcon = (p) => (
  <svg {...base} width="14" height="14" {...p} fill="currentColor">
    <path d="M7 4.5v15l13-7.5-13-7.5Z" />
  </svg>
);

export const ArrowIcon = (p) => (
  <svg {...base} width="16" height="16" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const DownloadIcon = (p) => (
  <svg {...base} width="16" height="16" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export const socialIcons = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  kaggle: KaggleIcon,
  instagram: InstagramIcon
};

export const socialLabels = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  kaggle: 'Kaggle',
  instagram: 'Instagram'
};
