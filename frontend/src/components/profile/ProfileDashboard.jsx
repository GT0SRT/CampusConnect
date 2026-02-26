import { useMemo, useState } from "react";
import { BookOpen, MessageSquare, Bookmark, Github, Linkedin, Globe } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { TabsSection } from "./components/TabsSection";
import { CardRenderer } from "./components/CardRenderer";
import { EditModal } from "./components/EditModal";
import { ProfileRefreshingState, ProfileTabError, ProfileTabLoading } from "./components/ProfileTabState";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { SkillsSection } from "./sections/SkillsSection";
import { InterestsSection } from "./sections/InterestsSection";
import { ProjectsSection } from "./sections/ProjectsSection";

const defaultProfile = {
    fullName: "Campus User",
    username: "campususer",
    verified: false,
    statusTag: "Student",
    availability: "Available",
    bio: "Add a short professional summary to help others know your goals and interests.",
    education: [],
    experience: [],
    skills: ["C++"],
    interests: [],
    projects: [],
    socialLinks: {
        github: "github.com/campususer",
        linkedin: "",
        portfolio: "",
    },
    stats: {
        posts: 0,
        threads: 0,
        karma: 0,
    },
};

export default function ProfileDashboard({
    isMe = false,
    profile = defaultProfile,
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
    error = null,
    onRetry,
}) {
    const mergedProfile = { ...defaultProfile, ...profile };

    const tabs = useMemo(() => {
        const baseTabs = [
            { key: "posts", label: "Posts", icon: BookOpen },
            { key: "threads", label: "Threads", icon: MessageSquare },
        ];

        if (isMe) {
            return [
                ...baseTabs,
                { key: "saved-posts", label: "Saved Posts", icon: Bookmark },
                { key: "saved-threads", label: "Saved Threads", icon: Bookmark },
            ];
        }

        return baseTabs;
    }, [isMe]);

    const [selectedTab, setSelectedTab] = useState("posts");
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const activeTab = tabs.find((tab) => tab.key === selectedTab) ? selectedTab : tabs[0]?.key || "posts";

    const renderTabCards = (items, renderFunction, emptyText, maxHeightClass, cardType, skeletonCount = 2) => {
        if (isLoading && items.length === 0) {
            return <ProfileTabLoading theme={theme} count={skeletonCount} />;
        }

        if (error && items.length === 0) {
            return <ProfileTabError theme={theme} error={error} onRetry={onRetry} />;
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
        posts: renderTabCards(posts, renderPost, "No posts yet.", "max-h-44 overflow-hidden", "post", 2),
        threads: renderTabCards(threads, renderThread, "No threads yet.", "max-h-52 overflow-hidden", "thread", 2),
        "saved-posts": renderTabCards(savedPosts, renderSavedPost, "No saved posts yet.", "max-h-44 overflow-hidden", "saved-post", 2),
        "saved-threads": renderTabCards(savedThreads, renderSavedThread, "No saved threads yet.", "max-h-52 overflow-hidden", "saved-thread", 2),
    };

    const outerText = theme === "dark" ? "text-slate-100" : "text-slate-900";
    const cardTone = theme === "dark" ? "glass-surface border-slate-800/40" : "glass-surface border-slate-300/60";
    const mutedText = theme === "dark" ? "text-slate-300" : "text-slate-600";
    const subText = theme === "dark" ? "text-slate-400" : "text-slate-600";
    const softChip = theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-300 bg-slate-100 text-slate-700";
    const tabWrapTone = theme === "dark" ? "glass-surface border-slate-800/40" : "glass-surface border-slate-300/60";
    const tabInnerTone = theme === "dark" ? "border-slate-800 bg-slate-950/85" : "border-slate-300 bg-slate-100/70";

    const socialItems = [
        {
            key: "github",
            icon: Github,
            value: mergedProfile.socialLinks?.github,
            href: mergedProfile.socialLinks?.github
                ? `https://github.com/${mergedProfile.socialLinks.github.replace(/^@/, "")}`
                : "",
            label: "GitHub",
        },
        {
            key: "linkedin",
            icon: Linkedin,
            value: mergedProfile.socialLinks?.linkedin,
            href: mergedProfile.socialLinks?.linkedin
                ? `https://www.linkedin.com/in/${mergedProfile.socialLinks.linkedin.replace(/^@/, "")}`
                : "",
            label: "LinkedIn",
        },
        {
            key: "portfolio",
            icon: Globe,
            value: mergedProfile.socialLinks?.portfolio,
            href: mergedProfile.socialLinks?.portfolio || "",
            label: "Portfolio",
        },
    ].filter((item) => item.value && item.href);

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
