import { FolderOpen, Star, Users } from "lucide-react";

export const DEFAULT_SQUAD_ID = "general";
export const LEGACY_DEFAULT_SQUAD_ID = "core-circle";
export const DEFAULT_SQUAD_NAME = "General";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const toUsername = (name = "") =>
    String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._]/g, "") || "campususer";

export function resolveSquadIcon(squad) {
    const normalizedId = String(squad?.id || "").toLowerCase();
    const normalizedName = String(squad?.name || "").toLowerCase();

    if (normalizedId === "hackathon-crew" || normalizedId === "mentors") {
        return Star;
    }

    if (normalizedId === "startup-founders") {
        return Users;
    }

    if (normalizedName.includes("hackathon") || normalizedName.includes("mentor")) {
        return Star;
    }

    if (normalizedName.includes("founder") || normalizedName.includes("startup")) {
        return Users;
    }

    return FolderOpen;
}
