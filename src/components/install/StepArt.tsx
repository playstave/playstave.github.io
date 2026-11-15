/**
 * Simple, original schematic drawings for each installation step. They show
 * WHERE to tap (highlighted in the accent colour), not an exact copy of any
 * browser's interface — menus differ between versions.
 */
import styles from './StepArt.module.css';

export type ArtKind =
  | 'open-browser' | 'safari-share' | 'ipad-share' | 'address-share' | 'menu-dots-bottom' | 'share-sheet' | 'ios-add'
  | 'home-screen' | 'android-menu' | 'android-menu-list' | 'android-confirm' | 'samsung-menu'
  | 'desktop-omnibox' | 'desktop-menu' | 'mac-dock' | 'in-app';

const Hi = ({ x, y, r = 11 }: { x: number; y: number; r?: number }) => (
  <circle cx={x} cy={y} r={r} className={styles.ring} />
);

function Phone({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const w = wide ? 200 : 132;
  return (
    <>
      <rect x={(220 - w) / 2} y="6" width={w} height="208" rx="18" className={styles.body} />
      <rect x={(220 - w) / 2 + 6} y="14" width={w - 12} height="192" rx="12" className={styles.screen} />
      {children}
    </>
  );
}

const MiniLogo = ({ x, y, s = 20 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 32})`}>
    <rect width="32" height="32" rx="7" fill="#1d1b17" />
    <path d="M6 9.5h20M6 13.5h20M6 17.5h20M6 21.5h20" stroke="#f4efe4" strokeWidth="1.4" opacity=".55" />
    <ellipse cx="14" cy="19.5" rx="4.4" ry="3.1" transform="rotate(-22 14 19.5)" fill="#d6512f" />
    <path d="M18 18.6V6.5" stroke="#d6512f" strokeWidth="2" strokeLinecap="round" />
  </g>
);

/** Share icon: a box with an arrow pointing up out of it. */
const ShareIcon = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x - 7} ${y - 8})`} className={styles.icon}>
    <path d="M4 7H2v9h10V7h-2" /><path d="M7 1v10M4 4l3-3 3 3" />
  </g>
);
const Dots = ({ x, y, vertical = true }: { x: number; y: number; vertical?: boolean }) => (
  <g className={styles.fill}>
    {[-5, 0, 5].map((d) => <circle key={d} cx={vertical ? x : x + d} cy={vertical ? y + d : y} r="1.6" />)}
  </g>
);
const Line = ({ x, y, w }: { x: number; y: number; w: number }) => <rect x={x} y={y} width={w} height="5" rx="2.5" className={styles.muted} />;
const PageLines = ({ x0 = 58, w = 104 }: { x0?: number; w?: number }) => (
  <>{[60, 74, 88, 102, 116].map((y, i) => <Line key={y} x={x0} y={y} w={i % 2 ? w * 0.7 : w} />)}</>
);
const AddressBar = ({ x0 = 52, w = 116, y = 24 }: { x0?: number; w?: number; y?: number }) => (
  <><rect x={x0} y={y} width={w} height="16" rx="8" className={styles.bar} /><text x={x0 + 10} y={y + 11.5} className={styles.tiny}>stave</text></>
);

export function StepArt({ kind, label }: { kind: ArtKind; label: string }) {
  let art: React.ReactNode;
  switch (kind) {
    case 'open-browser':
      art = <Phone><AddressBar /><rect x="52" y="24" width="116" height="16" rx="8" className={styles.ringRect} /><MiniLogo x={98} y={60} s={24} /><Line x={66} y={98} w={88} /><Line x={74} y={110} w={72} /></Phone>;
      break;
    case 'safari-share':
      art = <Phone><AddressBar y={170} /><PageLines />
        {[66, 88, 132, 154].map((x) => <rect key={x} x={x - 4} y="194" width="8" height="8" rx="2" className={styles.muted} />)}
        <ShareIcon x={110} y={198} /><Hi x={110} y={197} /></Phone>;
      break;
    case 'ipad-share':
      art = <Phone wide><rect x="26" y="20" width="168" height="18" rx="5" className={styles.bar} /><text x="36" y="32" className={styles.tiny}>stave</text>
        <ShareIcon x={178} y={30} /><Hi x={178} y={29} /><PageLines x0={36} w={148} /></Phone>;
      break;
    case 'address-share':
      art = <Phone><AddressBar w={92} /><ShareIcon x={158} y={33} /><Hi x={158} y={32} /><PageLines /></Phone>;
      break;
    case 'menu-dots-bottom':
      art = <Phone><AddressBar y={170} /><PageLines /><Dots x={150} y={198} vertical={false} /><Hi x={150} y={198} /></Phone>;
      break;
    case 'share-sheet':
      art = <Phone><rect x="50" y="78" width="120" height="124" rx="10" className={styles.sheet} />
        <Line x={62} y={92} w={70} />
        {[112, 132].map((y) => <g key={y}><rect x="60" y={y - 6} width="100" height="16" rx="4" className={styles.row} /><Line x={66} y={y} w={56} /></g>)}
        <rect x="60" y="146" width="100" height="18" rx="4" className={styles.rowHi} />
        <text x="66" y="158" className={styles.small}>Add to Home Screen</text>
        <g className={styles.icon} transform="translate(146 149)"><rect x="0" y="0" width="10" height="10" rx="2" /><path d="M5 2.5v5M2.5 5h5" /></g>
        <path d="M110 174v14M104 182l6 6 6-6" className={styles.icon} />
      </Phone>;
      break;
    case 'ios-add':
      art = <Phone><text x="56" y="34" className={styles.small}>Cancel</text><text x="146" y="34" className={styles.smallStrong}>Add</text><Hi x={153} y={30} r={13} />
        <rect x="54" y="50" width="112" height="40" rx="8" className={styles.row} /><MiniLogo x={60} y={56} s={28} /><text x="96" y="74" className={styles.smallStrong}>Stave</text>
        <PageLines x0={58} w={104} /></Phone>;
      break;
    case 'home-screen':
      art = <Phone>{[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => {
        const x = 58 + c * 38, y = 34 + r * 42;
        return r === 1 && c === 1
          ? <g key={`${r}${c}`}><MiniLogo x={x} y={y} s={28} /><Hi x={x + 14} y={y + 14} r={19} /><text x={x + 14} y={y + 38} textAnchor="middle" className={styles.tiny}>Stave</text></g>
          : <rect key={`${r}${c}`} x={x} y={y} width="28" height="28" rx="7" className={styles.muted} />;
      }))}</Phone>;
      break;
    case 'android-menu':
      art = <Phone><AddressBar w={96} /><Dots x={160} y={32} /><Hi x={160} y={32} /><PageLines /></Phone>;
      break;
    case 'samsung-menu':
      art = <Phone><AddressBar /><PageLines />{[66, 88, 110, 132].map((x) => <rect key={x} x={x - 4} y="194" width="8" height="8" rx="2" className={styles.muted} />)}
        <g className={styles.icon}><path d="M147 194h10M147 198h10M147 202h10" /></g><Hi x={152} y={198} /></Phone>;
      break;
    case 'android-menu-list':
      art = <Phone><AddressBar w={96} /><rect x="96" y="40" width="78" height="120" rx="6" className={styles.sheet} />
        {[56, 76, 96].map((y) => <Line key={y} x={104} y={y} w={52} />)}
        <rect x="100" y="110" width="70" height="18" rx="4" className={styles.rowHi} /><text x="104" y="122" className={styles.tiny}>Install app</text>
        <Line x={104} y={140} w={46} /></Phone>;
      break;
    case 'android-confirm':
      art = <Phone><PageLines /><rect x="50" y="70" width="120" height="84" rx="10" className={styles.sheet} />
        <MiniLogo x={62} y={82} s={22} /><text x="90" y="97" className={styles.smallStrong}>Install Stave?</text>
        <text x="94" y="140" className={styles.small}>Cancel</text><text x="134" y="140" className={styles.smallStrong}>Install</text><Hi x={147} y={136} r={15} /></Phone>;
      break;
    case 'desktop-omnibox':
      art = <>
        <rect x="8" y="30" width="204" height="150" rx="10" className={styles.body} /><rect x="14" y="36" width="192" height="138" rx="6" className={styles.screen} />
        <rect x="22" y="44" width="176" height="16" rx="8" className={styles.bar} /><text x="32" y="55" className={styles.tiny}>stave</text>
        <g className={styles.icon} transform="translate(176 46)"><rect x="0" y="1" width="12" height="9" rx="1.5" /><path d="M6 3v5M3.5 5.5 6 8l2.5-2.5" /></g><Hi x={182} y={52} />
        <MiniLogo x={98} y={80} s={24} /><Line x={60} y={118} w={100} /><Line x={74} y={132} w={72} />
      </>;
      break;
    case 'desktop-menu':
      art = <>
        <rect x="8" y="30" width="204" height="150" rx="10" className={styles.body} /><rect x="14" y="36" width="192" height="138" rx="6" className={styles.screen} />
        <rect x="22" y="44" width="150" height="16" rx="8" className={styles.bar} /><Dots x={190} y={52} />
        <rect x="112" y="64" width="88" height="96" rx="6" className={styles.sheet} />{[78, 96].map((y) => <Line key={y} x={120} y={y} w={60} />)}
        <rect x="116" y="110" width="80" height="18" rx="4" className={styles.rowHi} /><text x="120" y="122" className={styles.tiny}>Install Stave…</text>
        <Line x={120} y={142} w={50} />
      </>;
      break;
    case 'mac-dock':
      art = <>
        <rect x="8" y="20" width="204" height="150" rx="10" className={styles.body} /><rect x="14" y="26" width="192" height="138" rx="6" className={styles.screen} />
        <text x="24" y="40" className={styles.small}>File</text><rect x="20" y="46" width="96" height="70" rx="6" className={styles.sheet} />
        <Line x={28} y={58} w={60} /><rect x="24" y="72" width="88" height="18" rx="4" className={styles.rowHi} /><text x="28" y="84" className={styles.tiny}>Add to Dock…</text><Line x={28} y={100} w={50} />
        <rect x="50" y="178" width="120" height="30" rx="10" className={styles.sheet} />{[66, 90, 130, 154].map((x) => <rect key={x} x={x - 9} y="183" width="18" height="18" rx="5" className={styles.muted} />)}<MiniLogo x={101} y={183} s={18} />
      </>;
      break;
    case 'in-app':
      art = <Phone><text x="56" y="34" className={styles.small}>Done</text><Dots x={158} y={30} vertical={false} /><PageLines />
        <rect x="70" y="40" width="100" height="58" rx="8" className={styles.sheet} /><Line x={78} y={52} w={60} />
        <rect x="74" y="66" width="92" height="18" rx="4" className={styles.rowHi} /><text x="78" y="78" className={styles.tiny}>Open in browser</text></Phone>;
      break;
  }
  return <svg viewBox="0 0 220 220" className={styles.art} role="img" aria-label={label}>{art}</svg>;
}
