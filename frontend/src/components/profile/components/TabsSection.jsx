import { AnimatePresence, motion } from "framer-motion";
import { TabButton } from "../../ui/TabButton";
import { DefaultTabList } from "../../ui/DefaultTabList";
import { EmptyRow } from "../../ui/EmptyRow";

const fadeSlide = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

const MotionDiv = motion.div;

export function TabsSection({
    tabs,
    activeTab,
    setSelectedTab,
    tabContent,
    theme,
    tabWrapTone,
    tabInnerTone,
}) {
    return (
        <section className={`rounded-2xl border p-4 ${tabWrapTone}`}>
            <div
                className={`mb-4 flex flex-nowrap gap-2 overflow-x-auto rounded-2xl border p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${tabInnerTone}`}
            >
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.key}
                        label={tab.label}
                        icon={tab.icon}
                        active={activeTab === tab.key}
                        onClick={() => setSelectedTab(tab.key)}
                        theme={theme}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                <MotionDiv
                    key={activeTab}
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="min-h-28"
                >
                    {tabContent[activeTab]}
                </MotionDiv>
            </AnimatePresence>
        </section>
    );
}
