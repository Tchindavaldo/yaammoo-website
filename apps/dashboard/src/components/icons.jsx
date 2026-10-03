// Jeu d'icones en SVG inline — aucune dependance, trace unifie
// (grille 24, contour 1.75, extremites arrondies, couleur heritee).
// Usage : <Icon name="orders" size={18} />

const PATHS = {
  overview: "M4 11l8-7 8 7v9h-6v-6H10v6H4z",
  orders: "M6 8h12l-1 12H7z M9 8a3 3 0 016 0",
  pos: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z M4 10h16 M8 14h2 M14 14h2",
  menus: "M5 4v9a3 3 0 003 3v4 M8 4v6 M16 4c-1.5 2-2 3.5-2 5s.7 2.5 2 3v8",
  wallet: "M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3z M3 11h18",
  shops: "M4 9l1.5-4h13L20 9 M5 9h14v11H5z M9 9a3 3 0 006 0",
  users:
    "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20 M9.5 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z M21 20v-1.5a4 4 0 0 0-3-3.87 M16.5 4.13a4 4 0 0 1 0 7.75",
  chart: "M4 20h16 M7 20v-6 M12 20V7 M17 20v-9",

  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M20 20l-3.9-3.9",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  folder: "M4 7a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z",
  support:
    "M4 14v-2a8 8 0 0 1 16 0v2 M4 13h2.5v6H4a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 4 13Z M17.5 13H20a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 20 19h-2.5v-6Z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M6 6l2 2 M16 16l2 2 M18 6l-2 2 M8 16l-2 2",
  team:
    "M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M4 20c0-3 3-5 6-5s6 2 6 5 M18 8v4 M16 10h4",
  // Fleche de sortie de la carte compte, tracé du design.
  exit: "M10 5H5v14h5 M14 12h7 M18 9l3 3-3 3",
  grid: "M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v7H4z M13 14h7v7h-7z",
  percent: "M6 18L18 6 M7.5 7.5h.01 M16.5 16.5h.01",
  filter: "M4 6h16 M7 12h10 M10 18h4",
  calendar:
    "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z M4 10.5h16 M8 4v4 M16 4v4",
  refresh:
    "M20 11a8 8 0 0 0-13.7-5.2L4 8 M4 4v4h4 M4 13a8 8 0 0 0 13.7 5.2L20 16 M20 20v-4h-4",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  check: "M4.5 12.5 9.5 17.5 19.5 7",
  close: "M6 6l12 12 M18 6 6 18",
  chevronLeft: "M14.5 5 8 12l6.5 7",
  chevronRight: "M9.5 5 16 12l-6.5 7",
  chevronDown: "M5 9.5 12 16l7-6.5",
  arrowRight: "M4 12h15 M13.5 6 20 12l-6.5 6",

  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7.5V12l3 2",
  bike: "M5.5 20a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M18.5 20a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M9 16.5h5l-3-8H8.5 M14 8.5h4",
  store: "M7 15h10 M9 11h6 M4 5h16v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z",
  pin: "M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  phone:
    "M8.5 3.5h-3A1.5 1.5 0 0 0 4 5c0 8.3 6.7 15 15 15a1.5 1.5 0 0 0 1.5-1.5v-3l-4-1.5-2 2a13.5 13.5 0 0 1-5.5-5.5l2-2-2.5-4Z",
  printer:
    "M7 9V4h10v5 M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2 M7 14h10v6H7v-6Z",
  receipt:
    "M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z M9 8h6 M9 12h6",
  image:
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M9 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M3.5 16.5 8.5 12l4 3.5L16 13l4.5 4",
  inbox:
    "M4 13h4l1.5 3h5L16 13h4 M4 13 6.5 5h11L20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z",
  alert: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 8v5 M12 16.2v.1",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 12.2l2.8 2.8L16 9.5",
  logout: "M14 20H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h8 M17 8.5 20.5 12 17 15.5 M20 12H10",
  hamburger: "M4 7h16 M4 12h16 M4 17h16",
  panel: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z M9.5 5v14",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20a7.5 7.5 0 0 1 15 0",
  swap: "M7 4 4 7l3 3 M4 7h11a4 4 0 0 1 0 8h-1 M17 20l3-3-3-3 M20 17H9",
  trend: "M4 16.5 9.5 11l3.5 3.5L20 7.5 M20 12V7.5h-4.5",
};

export function Icon({ name, size = 18, strokeWidth = 1.75, ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

export default Icon;
