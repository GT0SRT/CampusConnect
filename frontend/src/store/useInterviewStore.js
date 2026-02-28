import { create } from 'zustand';

export const useInterviewStore = create((set) => ({
    isInCall: false,
    activeSession: null,
    interviewHistory: [],

    setIsInCall: (inCall) => set({ isInCall: inCall }),
    setActiveSession: (session) => set({ activeSession: session }),
    clearActiveSession: () => set({ activeSession: null }),
    setInterviewHistory: (interviews) => set({ interviewHistory: Array.isArray(interviews) ? interviews : [] }),
    mergeInterviewHistory: (incomingInterviews) => set((state) => {
        const incoming = Array.isArray(incomingInterviews) ? incomingInterviews : [];
        const mergedByKey = new Map();

        const getInterviewKey = (interview) => {
            if (!interview || typeof interview !== "object") return null;
            return String(
                interview.persistedRecordId ||
                interview.metadata?.localInterviewId ||
                interview.id ||
                `${interview.company || "unknown"}-${interview.timestamp || Date.now()}`
            );
        };

        const upsert = (interview) => {
            const key = getInterviewKey(interview);
            if (!key) return;

            if (!mergedByKey.has(key)) {
                mergedByKey.set(key, interview);
                return;
            }

            const existing = mergedByKey.get(key);
            mergedByKey.set(key, {
                ...existing,
                ...interview,
                analysis: interview.analysis ?? existing.analysis,
            });
        };

        state.interviewHistory.forEach(upsert);
        incoming.forEach(upsert);

        const merged = Array.from(mergedByKey.values()).sort(
            (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );

        return { interviewHistory: merged };
    }),
    addToHistory: (interview) => set((state) => ({
        interviewHistory: [interview, ...state.interviewHistory],
    })),
    updateHistoryInterview: (id, updates) => set((state) => ({
        interviewHistory: state.interviewHistory.map((interview) =>
            String(interview.id) === String(id)
                ? { ...interview, ...updates }
                : interview
        ),
    })),
}));
