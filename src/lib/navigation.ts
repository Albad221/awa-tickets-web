import { CalendarDays, Plus, User, Wallet, Settings, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Événements",
    items: [
      { label: "Mes événements", href: "/events", icon: CalendarDays },
      { label: "Créer un événement", href: "/events/new", icon: Plus },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Profil", href: "/profile", icon: User },
      { label: "Paiements", href: "/payouts", icon: Wallet },
      { label: "Paramètres", href: "/settings", icon: Settings },
    ],
  },
];
