// =======================================================
// TALENT PASSPORT ADMIN DESIGN SYSTEM
// adminTheme.ts
// =======================================================

export const colors = {
  // Brand
  primary: "#143B73",
  primaryDark: "#0F2E5C",
  secondary: "#F97316",

  // Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceHover: "#F8FAFC",

  // Borders
  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  // Text
  text: "#0F172A",
  textSecondary: "#475569",
  muted: "#64748B",

  // Status
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  successBg: "#DCFCE7",
  warningBg: "#FEF3C7",
  dangerBg: "#FEE2E2",
  infoBg: "#DBEAFE",

  // Hero
  heroStart: "#071952",
  heroEnd: "#143B73",

  // Misc
  white: "#FFFFFF",
  black: "#000000",

  shadow: "rgba(15,23,42,0.08)",
  shadowLarge: "rgba(15,23,42,0.14)"
};

// =======================================================
// SPACING
// =======================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40
};

// =======================================================
// RADIUS
// =======================================================

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  round: 999
};

// =======================================================
// TYPOGRAPHY
// =======================================================

export const typography = {
  heroTitle: {
    fontSize: 40,
    fontWeight: 700 as const
  },

  heroSubtitle: {
    fontSize: 16,
    fontWeight: 500 as const
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: 700 as const
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700 as const
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600 as const
  },

  body: {
    fontSize: 14,
    fontWeight: 500 as const
  },

  metric: {
    fontSize: 34,
    fontWeight: 700 as const
  },

  caption: {
    fontSize: 12,
    fontWeight: 500 as const
  }
};

// =======================================================
// SHADOWS
// =======================================================

export const shadows = {
  card: "0 2px 12px rgba(15,23,42,0.05)",

  hover: "0 8px 30px rgba(15,23,42,0.10)",

  hero: "0 20px 60px rgba(20,59,115,0.30)",

  modal: "0 30px 80px rgba(15,23,42,0.20)"
};

// =======================================================
// CARD STYLES
// =======================================================

export const cardStyles = {
  background: colors.surface,

  borderRadius: radius.lg,

  border: `1px solid ${colors.borderLight}`,

  boxShadow: shadows.card,

  padding: 24
};

// =======================================================
// BUTTONS
// =======================================================

export const buttons = {
  primary: {
    background: colors.primary,
    color: colors.white,
    border: "none",
    borderRadius: radius.md,
    padding: "12px 22px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.25s"
  },

  secondary: {
    background: colors.secondary,
    color: colors.white,
    border: "none",
    borderRadius: radius.md,
    padding: "12px 22px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.25s"
  },

  ghost: {
    background: colors.surface,
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: "12px 22px",
    fontWeight: 600,
    cursor: "pointer"
  },

  danger: {
    background: colors.danger,
    color: colors.white,
    border: "none",
    borderRadius: radius.md,
    padding: "12px 22px",
    fontWeight: 600,
    cursor: "pointer"
  }
};

// =======================================================
// INPUTS
// =======================================================

export const input = {
  width: "100%",

  padding: "12px 16px",

  borderRadius: radius.md,

  border: `1px solid ${colors.border}`,

  background: colors.surface,

  fontSize: 14,

  outline: "none",

  color: colors.text
};

// =======================================================
// TABLE
// =======================================================

export const table = {
  width: "100%",

  borderCollapse: "collapse" as const
};

// =======================================================
// LAYOUT
// =======================================================

export const layout = {
  page: {
    padding: 32,
    background: colors.background,
    minHeight: "100vh"
  },

  section: {
    marginTop: 24
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 20
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 20
  },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 20
  }
};

// =======================================================
// STATUS COLORS
// =======================================================

export const statusColors = {
  allocated: {
    background: colors.infoBg,
    color: colors.info
  },

  contacted: {
    background: colors.warningBg,
    color: colors.warning
  },

  counselling: {
    background: "#F3E8FF",
    color: "#7E22CE"
  },

  admitted: {
    background: colors.successBg,
    color: colors.success
  },

  rejected: {
    background: colors.dangerBg,
    color: colors.danger
  },

  pending: {
    background: "#F1F5F9",
    color: "#334155"
  }
};