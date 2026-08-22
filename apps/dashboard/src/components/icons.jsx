// Jeu d'icones en SVG inline — aucune dependance, trace unifie
// (grille 24, contour 1.75, extremites arrondies, couleur heritee).
// Usage : <Icon name="orders" size={18} />

const PATHS = {
  overview: "M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z",
  orders:
    "M7 3h10a1 1 0 0 1 1 1v16.5l-3-1.75-3 1.75-3-1.75L6 20.5V4a1 1 0 0 1 1-1Z M9.5 8h5 M9.5 12h5",
  pos: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z M4 10h16 M8 14h2 M14 14h2",
  menus:
    "M5 3v7a2.5 2.5 0 0 0 5 0V3 M7.5 10v11 M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5Z M17 12v9",
  wallet:
    "M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2 M3 8v8a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-2 M21 10v4h-4a2 2 0 0 1 0-4h4Z",
  shops:
    "M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z M3.5 9 5 4h14l1.5 5 M9 20v-6h6v6",
  users:
    "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20 M9.5 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z M21 20v-1.5a4 4 0 0 0-3-3.87 M16.5 4.13a4 4 0 0 1 0 7.75",
  chart: "M4 20h16 M7 20v-6 M12 20V7 M17 20v-9",

  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M20 20l-3.9-3.9",
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
