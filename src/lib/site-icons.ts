import type { SiteStatIcon, SocialPlatform } from "@prisma/client";
import {
  Anchor,
  Award,
  Building,
  Calendar,
  Facebook,
  GraduationCap,
  Handshake,
  Instagram,
  Linkedin,
  Share2,
  Ship,
  Star,
  Twitter,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export const SITE_STAT_ICONS: Record<SiteStatIcon, LucideIcon> = {
  USERS: Users,
  GRADUATION_CAP: GraduationCap,
  CALENDAR: Calendar,
  HANDSHAKE: Handshake,
  AWARD: Award,
  SHIP: Ship,
  ANCHOR: Anchor,
  BUILDING: Building,
  STAR: Star,
};

export const SOCIAL_PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  FACEBOOK: Facebook,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  YOUTUBE: Youtube,
  INSTAGRAM: Instagram,
  TIKTOK: Share2,
  OTHER: Share2,
};

export const SITE_STAT_ICON_OPTIONS = [
  { value: "USERS", label: "Personnes" },
  { value: "GRADUATION_CAP", label: "Formation" },
  { value: "CALENDAR", label: "Calendrier" },
  { value: "HANDSHAKE", label: "Partenariat" },
  { value: "AWARD", label: "Médaille" },
  { value: "SHIP", label: "Bateau" },
  { value: "ANCHOR", label: "Ancre" },
  { value: "BUILDING", label: "Bâtiment" },
  { value: "STAR", label: "Étoile" },
] as const;

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TWITTER", label: "Twitter / X" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "OTHER", label: "Autre" },
] as const;

export function socialPlatformLabel(platform: SocialPlatform): string {
  return SOCIAL_PLATFORM_OPTIONS.find((opt) => opt.value === platform)?.label ?? platform;
}
