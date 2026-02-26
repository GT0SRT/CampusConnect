// UI Components - Reusable presentational components
export { StatItem, SectionShell, EmptyRow, TabButton, DefaultTabList } from "./ui";

// Profile Components
export { default as ProfileDashboard } from "./profile/ProfileDashboard";
export { ProfileHeader, TabsSection, CardRenderer, EditModal } from "./profile/components";
export { EducationSection, ExperienceSection, SkillsSection, InterestsSection, ProjectsSection } from "./profile/sections";

// Common Components
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as PrivateRoute } from "./PrivateRoute";

// Other component exports can be added here as they're organized
