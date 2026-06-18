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
  Building2,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Paperclip,
  FolderOpen,
  Globe,
  Send,
} from "lucide-react";
import type { PermissionResource } from "@/lib/auth/rbac";

export type AdminNavChild = {
  href: string;
  label: string;
  icon: LucideIcon;
  resource: PermissionResource | "dashboard" | "audit";
  badgeKey?: "admissions" | "contact" | "reclamations";
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  resource: PermissionResource | "dashboard" | "audit";
  badgeKey?: "admissions" | "contact" | "reclamations";
  children?: AdminNavChild[];
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
    title: "CMS Site Web",
    items: [
      {
        href: "/admin/hero",
        label: "Accueil",
        icon: Home,
        resource: "hero",
        children: [
          { href: "/admin/hero", label: "Hero / Slider", icon: Presentation, resource: "hero" },
          { href: "/admin/highlights", label: "Cartes sous hero", icon: PanelTop, resource: "hero" },
          { href: "/admin/home-formations", label: "Formations vedette", icon: GraduationCap, resource: "formations" },
          { href: "/admin/home-engagement", label: "Engagement", icon: HeartHandshake, resource: "hero" },
          { href: "/admin/partners", label: "Partenaires", icon: Handshake, resource: "formations" },
        ],
      },
      {
        href: "/admin/pages",
        label: "Le Centre",
        icon: Building2,
        resource: "pages",
        children: [
          { href: "/admin/pages", label: "Présentation", icon: FileStack, resource: "pages" },
          { href: "/admin/director", label: "Mot du directeur", icon: UserCircle, resource: "hero" },
          { href: "/admin/organigramme", label: "Organigramme", icon: Network, resource: "pages" },
          { href: "/admin/chiffres", label: "Nador en Chiffres", icon: BarChart3, resource: "pages" },
        ],
      },
      {
        href: "/admin/formations",
        label: "Formations",
        icon: GraduationCap,
        resource: "formations",
      },
      {
        href: "/admin/news",
        label: "Actualités & Agenda",
        icon: Newspaper,
        resource: "news",
        children: [
          { href: "/admin/news", label: "Actualités", icon: Newspaper, resource: "news" },
          { href: "/admin/events", label: "Agenda", icon: CalendarDays, resource: "hero" },
          { href: "/admin/documents", label: "Communiqués", icon: Download, resource: "pages" },
        ],
      },
      {
        href: "/admin/gallery",
        label: "Médiathèque",
        icon: Image,
        resource: "gallery",
      },
      {
        href: "/admin/contact",
        label: "Contact",
        icon: Mail,
        resource: "contact",
        children: [
          { href: "/admin/contact", label: "Messages", icon: Mail, resource: "contact", badgeKey: "contact" },
          { href: "/admin/reclamations", label: "Réclamations", icon: AlertCircle, resource: "contact", badgeKey: "reclamations" },
        ],
      },
      {
        href: "/admin/navigation",
        label: "Navigation du site",
        icon: Menu,
        resource: "navigation",
      },
    ],
  },
  {
    title: "Inscriptions",
    items: [
      {
        href: "/admin/inscriptions",
        label: "Dossiers candidats",
        icon: FileText,
        resource: "admissions",
        badgeKey: "admissions",
        children: [
          { href: "/admin/inscriptions", label: "Tous les dossiers", icon: FileText, resource: "admissions" },
          { href: "/admin/inscriptions?status=PENDING", label: "En attente", icon: Clock, resource: "admissions" },
          { href: "/admin/inscriptions?status=IN_REVIEW", label: "En cours d'étude", icon: Globe, resource: "admissions" },
          { href: "/admin/inscriptions?status=ACCEPTED", label: "Acceptés", icon: CheckCircle, resource: "admissions" },
          { href: "/admin/inscriptions?status=REJECTED", label: "Refusés", icon: XCircle, resource: "admissions" },
        ],
      },
      {
        href: "/admin/inscriptions/niveaux",
        label: "Niveaux",
        icon: GraduationCap,
        resource: "admissions",
      },
      {
        href: "/admin/inscriptions/annees",
        label: "Années de concours",
        icon: CalendarDays,
        resource: "admissions",
      },
      {
        href: "/admin/inscriptions/conditions",
        label: "Conditions d'accès",
        icon: Globe,
        resource: "admissions",
      },
      {
        href: "/admin/inscriptions/pieces",
        label: "Pièces demandées",
        icon: Paperclip,
        resource: "admissions",
      },
    ],
  },
  {
    title: "Documents",
    items: [
      { href: "/admin/documents", label: "Documents publiés", icon: Download, resource: "pages" },
      { href: "/admin/documents/categories", label: "Catégories", icon: FolderOpen, resource: "pages" },
    ],
  },
  {
    title: "Utilisateurs",
    items: [
      { href: "/admin/users", label: "Administrateurs", icon: Users, resource: "users" },
      { href: "/admin/roles", label: "Rôles & permissions", icon: Shield, resource: "users" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { href: "/admin/settings", label: "Paramètres du site", icon: Settings, resource: "settings" },
      { href: "/admin/audit", label: "Journal d'audit", icon: ScrollText, resource: "audit" },
      { href: "/admin/email-logs", label: "Journal des emails", icon: Send, resource: "settings" },
    ],
  },
];
