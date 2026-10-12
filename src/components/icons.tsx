// 画面で使うアイコン。絵文字は使わずインライン SVG にする。

export function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" rx="6" fill="#C4F44D" />
      <path
        d="M10 8l-4 5 4 5M16 8l4 5-4 5"
        stroke="#0B0D11"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 1.8v10.4L12 7z" fill="currentColor" />
    </svg>
  );
}

export function TsFileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="3" fill="#6CD0FF" />
      <path
        d="M4.2 8.2h3.6M6 8.2v3.4M9 8.4c.4-.5 1-.7 1.7-.5.8.2.9.9.3 1.3-.7.4-1.1.6-1 1.3.1.6.9.8 1.6.4"
        stroke="#0B0D11"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect x="5" y="11" width="16" height="11" rx="3" fill="none" stroke="#C4F44D" strokeWidth="2" />
      <path d="M8.5 11V8.5a4.5 4.5 0 019 0V11" fill="none" stroke="#C4F44D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
