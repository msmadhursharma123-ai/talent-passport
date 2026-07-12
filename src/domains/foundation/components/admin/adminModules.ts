export type AdminModule =
  | "dashboard"
  | "foundation"
  | "users"
  | "learning"
  | "talent"
  | "competitions"
  | "marketplace"
  | "analytics"
  | "notifications"
  | "settings";

export interface AdminModuleItem {
  key: AdminModule;
  label: string;
  enabled: boolean;
}

export const ADMIN_MODULES: ReadonlyArray<AdminModuleItem> = [
  {
    key: "dashboard",
    label: "🏠 Dashboard",
    enabled: true,
  },
  {
    key: "foundation",
    label: "🏛 Foundation Hub",
    enabled: true,
  },
  {
    key: "users",
    label: "👥 User Management",
    enabled: true,
  },
  {
    key: "learning",
    label: "📚 Learning Intelligence",
    enabled: false,
  },
  {
    key: "talent",
    label: "🧬 Talent Passport",
    enabled: false,
  },
 {
    key: "competitions",
    label: "🏆 Competition Engine",
    enabled: true,
},
  {
    key: "marketplace",
    label: "🤝 Marketplace",
    enabled: false,
  },
  {
    key: "analytics",
    label: "📊 Analytics",
    enabled: true,
  },
  {
    key: "notifications",
    label: "🔔 Notifications",
    enabled: false,
  },
  {
    key: "settings",
    label: "⚙ Platform Settings",
    enabled: false,
  },
];