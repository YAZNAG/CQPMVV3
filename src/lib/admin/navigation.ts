import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  GraduationCap,
  Newspaper,
  Image,
  Handshake,
  Presentation,
  PanelTop,
  HeartHandshake,
  CalendarDays,
  Download,
  Mail,
  Menu,
  Network,
  BarChart3,
  FileStack,
  Settings,
  ScrollText,
  UserCircle,
  AlertCircle,
} from "lucide-react";
import type { PermissionResource } from "@/lib/auth/rbac";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  resource: PermissionResource | "dashboard" | "audit";
  badgeKey?: "admissions" | "contact" | "reclamations";
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        href: "/admin",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        resource: "dashboard",
      },
    ],
  },
  {
    title: "Gestion",
    items: [
      { href: "/admin/users", label: "Utilisateurs", icon: Users, resource: "users" },
      { href: "/admin/roles", label: "Rôles & permissions", icon: Shield, resource: "users" },
      {
        href: "/admin/admissions",
        label: "Inscriptions",
        icon: FileText,
        resource: "admissions",
        badgeKey: "admissions",
      },
    ],
  },
  {
    title: "Contenu",
    items: [
      {
        href: "/admin/formations",
        label: "Formations",
        icon: GraduationCap,
        resource: "formations",
      },
      {
        href: "/admin/home-formations",
        label: "Formations accueil",
        icon: PanelTop,
        resource: "formations",
      },
      { href: "/admin/news", label: "Actualités", icon: Newspaper, resource: "news" },
      { href: "/admin/events", label: "Événements", icon: CalendarDays, resource: "hero" },
      {
        href: "/admin/downloads",
        label: "Téléchargements",
        icon: Download,
        resource: "pages",
      },
      { href: "/admin/gallery", label: "Galerie", icon: Image, resource: "gallery" },
      { href: "/admin/hero", label: "Hero / Slider", icon: Presentation, resource: "hero" },
      { href: "/admin/highlights", label: "Cartes sous hero", icon: PanelTop, resource: "hero" },
      {
        href: "/admin/director",
        label: "Mot du directeur",
        icon: UserCircle,
        resource: "hero",
      },
      {
        href: "/admin/organigramme",
        label: "Organigramme",
        icon: Network,
        resource: "pages",
      },
      {
        href: "/admin/chiffres",
        label: "Nador en Chiffres",
        icon: BarChart3,
        resource: "pages",
      },
      {
        href: "/admin/home-engagement",
        label: "Engagement accueil",
        icon: HeartHandshake,
        resource: "hero",
      },
      {
        href: "/admin/partners",
        label: "Partenaires",
        icon: Handshake,
        resource: "formations",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        href: "/admin/contact",
        label: "Contact",
        icon: Mail,
        resource: "contact",
        badgeKey: "contact",
      },
      {
        href: "/admin/reclamations",
        label: "Réclamations",
        icon: AlertCircle,
        resource: "contact",
        badgeKey: "reclamations",
      },
    ],
  },
  {
    title: "Système",
    items: [
      {
        href: "/admin/pages",
        label: "Pages CMS",
        icon: FileStack,
        resource: "pages",
      },
      {
        href: "/admin/navigation",
        label: "Navigation du site",
        icon: Menu,
        resource: "navigation",
      },
      {
        href: "/admin/settings",
        label: "Paramètres du site",
        icon: Settings,
        resource: "settings",
      },
      {
        href: "/admin/audit",
        label: "Journal d'audit",
        icon: ScrollText,
        resource: "audit",
      },
    ],
  },
];
