export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Themes ──
// Ghostty-style theme definitions. Each theme is a flat color map.
export const themes = {
  aura: {
    name: "Aura",
    background: "#15141b",
    backgroundSecondary: "#1a1922",
    surface: "#1e1d27",
    foreground: "#edecee",
    foregroundMuted: "#6d6d6d",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#a277ff",
    accentSecondary: "#61ffca",
    danger: "#ff6767",
    warning: "#ffca85",
    priorityHigh: "#ff6767",
    priorityLow: "#61ffca",
    selection: "rgba(162, 119, 255, 0.15)",
  },
  catppuccinMocha: {
    name: "Catppuccin Mocha",
    background: "#1e1e2e",
    backgroundSecondary: "#232335",
    surface: "#28283d",
    foreground: "#cdd6f4",
    foregroundMuted: "#6c7086",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#89b4fa",
    accentSecondary: "#a6e3a1",
    danger: "#f38ba8",
    warning: "#f9e2af",
    priorityHigh: "#f38ba8",
    priorityLow: "#94e2d5",
    selection: "rgba(137, 180, 250, 0.15)",
  },
  catppuccinMacchiato: {
    name: "Catppuccin Macchiato",
    background: "#24273a",
    backgroundSecondary: "#292d42",
    surface: "#2e3247",
    foreground: "#cad3f5",
    foregroundMuted: "#6e738d",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#8aadf4",
    accentSecondary: "#a6da95",
    danger: "#ed8796",
    warning: "#eed49f",
    priorityHigh: "#ed8796",
    priorityLow: "#8bd5ca",
    selection: "rgba(138, 173, 244, 0.15)",
  },
  catppuccinFrappe: {
    name: "Catppuccin Frappe",
    background: "#303446",
    backgroundSecondary: "#353a4e",
    surface: "#3b4056",
    foreground: "#c6d0f5",
    foregroundMuted: "#737994",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#8caaee",
    accentSecondary: "#a6d189",
    danger: "#e78284",
    warning: "#e5c890",
    priorityHigh: "#e78284",
    priorityLow: "#81c8be",
    selection: "rgba(140, 170, 238, 0.15)",
  },
  tokyoNight: {
    name: "Tokyo Night",
    background: "#1a1b26",
    backgroundSecondary: "#1f202e",
    surface: "#24253a",
    foreground: "#c0caf5",
    foregroundMuted: "#565f89",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#7aa2f7",
    accentSecondary: "#9ece6a",
    danger: "#f7768e",
    warning: "#e0af68",
    priorityHigh: "#f7768e",
    priorityLow: "#7dcfff",
    selection: "rgba(122, 162, 247, 0.15)",
  },
  rosePine: {
    name: "Rose Pine",
    background: "#191724",
    backgroundSecondary: "#1e1c2c",
    surface: "#26233a",
    foreground: "#e0def4",
    foregroundMuted: "#6e6a86",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#c4a7e7",
    accentSecondary: "#9ccfd8",
    danger: "#eb6f92",
    warning: "#f6c177",
    priorityHigh: "#eb6f92",
    priorityLow: "#31748f",
    selection: "rgba(196, 167, 231, 0.15)",
  },
  rosePineMoon: {
    name: "Rose Pine Moon",
    background: "#232136",
    backgroundSecondary: "#28263e",
    surface: "#2e2c46",
    foreground: "#e0def4",
    foregroundMuted: "#6e6a86",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#c4a7e7",
    accentSecondary: "#9ccfd8",
    danger: "#eb6f92",
    warning: "#f6c177",
    priorityHigh: "#eb6f92",
    priorityLow: "#3e8fb0",
    selection: "rgba(196, 167, 231, 0.15)",
  },
  dracula: {
    name: "Dracula",
    background: "#282a36",
    backgroundSecondary: "#2d2f3d",
    surface: "#343746",
    foreground: "#f8f8f2",
    foregroundMuted: "#6272a4",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#bd93f9",
    accentSecondary: "#50fa7b",
    danger: "#ff5555",
    warning: "#f1fa8c",
    priorityHigh: "#ff5555",
    priorityLow: "#8be9fd",
    selection: "rgba(189, 147, 249, 0.15)",
  },
  gruvbox: {
    name: "Gruvbox",
    background: "#282828",
    backgroundSecondary: "#2e2e2e",
    surface: "#3c3836",
    foreground: "#ebdbb2",
    foregroundMuted: "#928374",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#fabd2f",
    accentSecondary: "#b8bb26",
    danger: "#fb4934",
    warning: "#fabd2f",
    priorityHigh: "#fb4934",
    priorityLow: "#8ec07c",
    selection: "rgba(250, 189, 47, 0.15)",
  },
  nord: {
    name: "Nord",
    background: "#2e3440",
    backgroundSecondary: "#333a47",
    surface: "#3b4252",
    foreground: "#d8dee9",
    foregroundMuted: "#616e88",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#81a1c1",
    accentSecondary: "#a3be8c",
    danger: "#bf616a",
    warning: "#ebcb8b",
    priorityHigh: "#bf616a",
    priorityLow: "#8fbcbb",
    selection: "rgba(129, 161, 193, 0.15)",
  },
  ayuDark: {
    name: "Ayu Dark",
    background: "#0b0e14",
    backgroundSecondary: "#10131a",
    surface: "#161a24",
    foreground: "#bfbdb6",
    foregroundMuted: "#565b66",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#e6b450",
    accentSecondary: "#7fd962",
    danger: "#f07178",
    warning: "#ffb454",
    priorityHigh: "#f07178",
    priorityLow: "#90e1c6",
    selection: "rgba(230, 180, 80, 0.15)",
  },
  ayuMirage: {
    name: "Ayu Mirage",
    background: "#1f2430",
    backgroundSecondary: "#242937",
    surface: "#2a2f3e",
    foreground: "#cccac2",
    foregroundMuted: "#5c6070",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#ffcc66",
    accentSecondary: "#87d96c",
    danger: "#f28779",
    warning: "#ffd173",
    priorityHigh: "#f28779",
    priorityLow: "#90e1c6",
    selection: "rgba(255, 204, 102, 0.15)",
  },
  midnight: {
    name: "Midnight",
    background: "#0E0E10",
    backgroundSecondary: "#131316",
    surface: "#1a1a1e",
    foreground: "#E0E0E0",
    foregroundMuted: "#555",
    border: "rgba(255, 255, 255, 0.08)",
    accent: "#E0E0E0",
    accentSecondary: "#38A89D",
    danger: "#E5443A",
    warning: "#FFCA85",
    priorityHigh: "#E5443A",
    priorityLow: "#38A89D",
    selection: "rgba(255, 255, 255, 0.15)",
  },
};

export const defaultTheme = "aura";

export function getTheme(name) {
  return themes[name] || themes[defaultTheme];
}

// ── Color utilities ──
const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = (r, g, b) =>
  "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");

export function priorityColor(index, total, theme) {
  const t_ = theme || themes[defaultTheme];
  const high = t_.priorityHigh;
  const low = t_.priorityLow;
  if (total <= 1) return high;
  const t = index / (total - 1);
  const [r1, g1, b1] = hexToRgb(high);
  const [r2, g2, b2] = hexToRgb(low);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

// Convert hex to "r, g, b" string for use in rgba()
export function hexToRgbStr(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}
