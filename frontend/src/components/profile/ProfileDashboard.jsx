import { useMemo, useState } from "react";
import { BookOpen, MessageSquare, Bookmark, Github, Linkedin, Globe } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { TabsSection } from "./components/TabsSection";
import { CardRenderer } from "./components/CardRenderer";
import { EditModal } from "./components/EditModal";
import { ProfileRefreshingState, ProfileTabLoading } from "./components/ProfileTabState";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { SkillsSection } from "./sections/SkillsSection";
import { InterestsSection } from "./sections/InterestsSection";
import { ProjectsSection } from "./sections/ProjectsSection";

export default function ProfileDashboard({
    isMe = false,
    profile,
    theme = "dark",
    posts = [],
    threads = [],
    savedPosts = [],
    savedThreads = [],
    onEditProfile,
    onConnect,
    onMessage,
    onEducationSave,
    onExperienceSave,
    onSkillsSave,
    onInterestsSave,
    onProjectsSave,
    renderPost,
    renderThread,
    renderSavedPost,
    renderSavedThread,
    isLoading = false,
    isRefreshing = false,
}) {
    const mergedProfile = profile;
    const postsCount = Array.isArray(posts) ? posts.length : 0;
    const threadsCount = Array.isArray(threads) ? threads.length : 0;
    const savedPostsCount = Array.isArray(savedPosts) ? savedPosts.length : 0;
    const savedThreadsCount = Array.isArray(savedThreads) ? savedThreads.length : 0;

    const tabs = useMemo(() => {
        const baseTabs = [
            { key: "posts", label: `Posts (${postsCount})`, icon: BookOpen },
            { key: "threads", label: `Threads (${threadsCount})`, icon: MessageSquare },
        ];

        if (isMe) {
            return [
                ...baseTabs,
                { key: "saved-posts", label: `Saved Posts (${savedPostsCount})`, icon: Bookmark },
                { key: "saved-threads", label: `Saved Threads (${savedThreadsCount})`, icon: Bookmark },
            ];
        }

        return baseTabs;
    }, [isMe, postsCount, threadsCount, savedPostsCount, savedThreadsCount]);

    const [selectedTab, setSelectedTab] = useState("posts");
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const activeTab = tabs.find((tab) => tab.key === selectedTab) ? selectedTab : tabs[0]?.key || "posts";

    const renderTabCards = (items, renderFunction, emptyText, maxHeightClass, cardType, skeletonCount = 2) => {
        if (isLoading && items.length === 0) {
            return <ProfileTabLoading theme={theme} count={skeletonCount} />;
        }

        return (
            <>
                {isRefreshing ? <ProfileRefreshingState theme={theme} /> : null}
                <CardRenderer
                    items={items}
                    renderFunction={renderFunction}
                    emptyText={emptyText}
                    maxHeightClass={maxHeightClass}
                    expandedCardId={expandedCardId}
                    setExpandedCardId={setExpandedCardId}
                    theme={theme}
                    cardType={cardType}
                />
            </>
        );
    };

    const tabContent = {
        posts: renderTabCards(posts, renderPost, "No posts yet. Create one.", "max-h-52 overflow-hidden", "post", 2),
        threads: renderTabCards(threads, renderThread, "No threads yet.", "max-h-52 overflow-hidden", "thread", 2),
        "saved-posts": renderTabCards(savedPosts, renderSavedPost, "No saved posts yet.", "max-h-52 overflow-hidden", "saved-post", 2),
        "saved-threads": renderTabCards(savedThreads, renderSavedThread, "No saved threads yet.", "max-h-52 overflow-hidden", "saved-thread", 2),
    };

    const outerText = theme === "dark" ? "text-slate-100" : "text-slate-900";
    const cardTone = theme === "dark" ? "glass-surface border-slate-800/40" : "glass-surface border-slate-300/60";
    const mutedText = theme === "dark" ? "text-slate-300" : "text-slate-600";
    const subText = theme === "dark" ? "text-slate-400" : "text-slate-600";
    const softChip = theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-300 bg-slate-100 text-slate-700";
    const tabWrapTone = theme === "dark" ? "glass-surface border-slate-800/40" : "glass-surface border-slate-300/60";
    const tabInnerTone = theme === "dark" ? "border-slate-800 bg-slate-950/85" : "border-slate-300 bg-slate-100/70";

    const knownIcons = {
        github: Github,
        linkedin: Linkedin,
        portfolio: Globe,
    };

    const formatSocialHref = (key, value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";

        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }

        if (key === "github") {
            return `https://github.com/${raw.replace(/^@/, "")}`;
        }

        if (key === "linkedin") {
            return `https://www.linkedin.com/in/${raw.replace(/^@/, "")}`;
        }

        return `https://${raw}`;
    };

    const socialItems = Object.entries(mergedProfile.socialLinks || {})
        .map(([key, value]) => ({
            key,
            icon: knownIcons[key] || Globe,
            href: formatSocialHref(key, value),
            label: key.charAt(0).toUpperCase() + key.slice(1),
        }))
        .filter((item) => item.href);

    const sectionSaveMap = {
        education: onEducationSave,
        experience: onExperienceSave,
        skills: onSkillsSave,
        interests: onInterestsSave,
        projects: onProjectsSave,
    };

    const handleSectionSave = (section, data) => {
        const saveHandler = sectionSaveMap[section];
        if (saveHandler) {
            saveHandler(data);
        }
        setEditingSection(null);
    };

    if (!mergedProfile) {
        return null;
    }

    const editSectionMeta = {
        education: { title: "Education", items: mergedProfile.education || [] },
        experience: { title: "Experience", items: mergedProfile.experience || [] },
        skills: { title: "Skills", items: mergedProfile.skills || [] },
        interests: { title: "Interests", items: mergedProfile.interests || [] },
        projects: { title: "Projects", items: mergedProfile.projects || [] },
    };

    const activeEditSection = editingSection ? editSectionMeta[editingSection] : null;

    return (
        <div className={`space-y-4 rounded-3xl border border-transparent bg-transparent p-4 ${outerText}`}>
            <ProfileHeader
                mergedProfile={mergedProfile}
                isMe={isMe}
                theme={theme}
                socialItems={socialItems}
                onEditProfile={onEditProfile}
                onConnect={onConnect}
                onMessage={onMessage}
                cardTone={cardTone}
                outerText={outerText}
                subText={subText}
                mutedText={mutedText}
                softChip={softChip}
            />

            <TabsSection
                tabs={tabs}
                activeTab={activeTab}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                tabContent={tabContent}
                theme={theme}
                tabWrapTone={tabWrapTone}
                tabInnerTone={tabInnerTone}
            />

            <div className="space-y-4">
                <EducationSection
                    education={mergedProfile.education}
                    isMe={isMe}
                    theme={theme}
                    onEditClick={() => setEditingSection("education")}
                    cardTone={cardTone}
                    outerText={outerText}
                    subText={subText}
                />

                <ExperienceSection
                    experience={mergedProfile.experience}
                    isMe={isMe}
                    theme={theme}
                    onEditClick={() => setEditingSection("experience")}
                    cardTone={cardTone}
                    outerText={outerText}
                    subText={subText}
                />

                <SkillsSection
                    skills={mergedProfile.skills}
                    isMe={isMe}
                    theme={theme}
                    onEditClick={() => setEditingSection("skills")}
                />

                <InterestsSection
                    interests={mergedProfile.interests}
                    isMe={isMe}
                    theme={theme}
                    onEditClick={() => setEditingSection("interests")}
                />

                <ProjectsSection
                    projects={mergedProfile.projects}
                    isMe={isMe}
                    theme={theme}
                    onEditClick={() => setEditingSection("projects")}
                    cardTone={cardTone}
                    outerText={outerText}
                    softChip={softChip}
                />
            </div>

            {activeEditSection ? (
                <EditModal
                    title={activeEditSection.title}
                    type={editingSection}
                    items={activeEditSection.items}
                    onClose={() => setEditingSection(null)}
                    onSave={(data) => handleSectionSave(editingSection, data)}
                    theme={theme}
                />
            ) : null}
        </div>
    );
}
