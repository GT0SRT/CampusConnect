import { create } from 'zustand';

export const useInterviewStore = create((set) => ({
    isInCall: false,
    activeSession: null,
    interviewHistory: [],

    setIsInCall: (inCall) => set({ isInCall: inCall }),
    setActiveSession: (session) => set({ activeSession: session }),
    clearActiveSession: () => set({ activeSession: null }),
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
