import api from "./api";

const LOCAL_ASSESSMENT_HISTORY_KEY = "campusconnect:assessment-history";

const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const toMinuteBucket = (value) => {
    const time = new Date(value || 0).getTime();
    return Number.isFinite(time) ? Math.floor(time / 60000) : 0;
};

const isLocalOnlyId = (id) => String(id || "").startsWith("local-");

const buildAssessmentFingerprint = (record = {}) => {
    const company = normalizeText(record.company);
    const role = normalizeText(record.role_name);
    const difficulty = normalizeText(record.difficulty || "moderate");
    const overall = toNumber(record.overallScore, 0);
    const correct = toNumber(record.correctAnswers, 0);
    const total = toNumber(record.totalQuestions, 0);
    const minuteBucket = toMinuteBucket(record.createdAt);

    return `${company}|${role}|${difficulty}|${overall}|${correct}|${total}|${minuteBucket}`;
};

const choosePreferredRecord = (a, b) => {
    const aLocal = isLocalOnlyId(a?.id);
    const bLocal = isLocalOnlyId(b?.id);

    if (aLocal !== bLocal) {
        return aLocal ? { ...a, ...b } : { ...b, ...a };
    }

    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    const aIsNewer = (Number.isFinite(aTime) ? aTime : 0) >= (Number.isFinite(bTime) ? bTime : 0);
    return aIsNewer ? { ...b, ...a } : { ...a, ...b };
};

export const mapAssessmentRecordToUi = (record) => ({
    id: record.id,
    company: record.companyName || "Practice",
    role_name: record.roleName || "SDE",
    difficulty: record.difficulty || "moderate",
    overallScore: toNumber(record.overallScore, 0),
    correctAnswers: toNumber(record.correctAnswers, 0),
    totalQuestions: toNumber(record.totalQuestions, 0),
    metrics: {
        technicalKnowledge: toNumber(record.metricTechnical, 0),
        accuracy: toNumber(record.metricAccuracy, 0),
    },
    topicsCovered: toArray(record.topicsCovered),
    strengths: toArray(record.strengths),
    weaknesses: record.improvements || "",
    feedback: record.feedback || "",
    questionsAnalysis: toArray(record.detailedAnalysis),
    createdAt: record.createdAt,
});

const getLocalHistory = () => {
    try {
        const raw = localStorage.getItem(LOCAL_ASSESSMENT_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const setLocalHistory = (records) => {
    try {
        localStorage.setItem(LOCAL_ASSESSMENT_HISTORY_KEY, JSON.stringify(Array.isArray(records) ? records : []));
    } catch {
    }
};

const mergeAssessmentHistory = (incoming = [], existing = []) => {
    const idMap = new Map();

    const upsert = (record) => {
        if (!record || typeof record !== "object") return;
        const key = String(record.id || `${record.company || "Practice"}-${record.role_name || "SDE"}-${record.createdAt || Date.now()}`);
        if (!idMap.has(key)) {
            idMap.set(key, record);
            return;
        }

        idMap.set(key, {
            ...idMap.get(key),
            ...record,
        });
    };

    existing.forEach(upsert);
    incoming.forEach(upsert);

    const fingerprintMap = new Map();

    Array.from(idMap.values()).forEach((record) => {
        const fingerprint = buildAssessmentFingerprint(record);
        if (!fingerprintMap.has(fingerprint)) {
            fingerprintMap.set(fingerprint, record);
            return;
        }

        const selected = choosePreferredRecord(fingerprintMap.get(fingerprint), record);
        fingerprintMap.set(fingerprint, selected);
    });

    return Array.from(fingerprintMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const createAssessmentRecord = async (payload) => {
    const optimisticRecord = {
        id: `local-${Date.now()}`,
        company: payload?.companyName || "Practice",
        role_name: payload?.roleName || "SDE",
        difficulty: payload?.difficulty || "moderate",
        overallScore: toNumber(payload?.overallScore, 0),
        correctAnswers: toNumber(payload?.correctAnswers, 0),
        totalQuestions: toNumber(payload?.totalQuestions, 0),
        metrics: {
            technicalKnowledge: toNumber(payload?.metrics?.technicalKnowledge, 0),
            accuracy: toNumber(payload?.metrics?.accuracy, 0),
        },
        topicsCovered: toArray(payload?.topicsCovered),
        strengths: toArray(payload?.strengths),
        weaknesses: payload?.improvements || "",
        feedback: payload?.feedback || "",
        questionsAnalysis: toArray(payload?.detailedAnalysis),
        createdAt: new Date().toISOString(),
    };

    const currentLocal = getLocalHistory();
    setLocalHistory(mergeAssessmentHistory([optimisticRecord], currentLocal));

    try {
        const response = await api.post("/assessments", payload);
        const saved = mapAssessmentRecordToUi(response.data || {});
        const localWithoutOptimistic = getLocalHistory().filter((record) => String(record?.id) !== String(optimisticRecord.id));
        const merged = mergeAssessmentHistory([saved], localWithoutOptimistic);
        setLocalHistory(merged);
        return response.data;
    } catch (error) {
        return optimisticRecord;
    }
};

export const getAssessmentHistory = async () => {
    const localHistory = getLocalHistory();

    try {
        const response = await api.get("/assessments");
        const remoteHistory = toArray(response.data).map(mapAssessmentRecordToUi);
        const merged = mergeAssessmentHistory(remoteHistory, localHistory);
        setLocalHistory(merged);
        return merged;
    } catch {
        return localHistory;
    }
};
