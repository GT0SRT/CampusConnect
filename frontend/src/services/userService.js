import api from "./api";

function normalizeUserResponse(user) {
    return {
        uid: user.uid || user.id,
        id: user.id || user.uid,
        username: user.username,
        email: user.email,
        name: user.fullName || "",
        profileImageUrl: user.profileImageUrl || "",
        profile_pic: user.profileImageUrl || "",
        campus: user.collegeName || "",
        branch: user.headline || "",
        bio: user.about || "",
        profileCompletePercentage: user.profileCompletePercentage ?? 0,
        tags: user.tags || [],
        skills: user.skills || [],
        interests: user.interests || [],
        socialLinks: user.socialLinks || {},
        education: user.education || [],
        experience: user.experience || [],
        projects: user.projects || [],
    };
}

function mapPayloadToBackend(data) {
    const payload = {
        username: data.username,
        fullName: data.name,
        profileImageUrl: data.profile_pic ?? data.profileImageUrl,
        collegeName: data.campus,
        headline: data.branch,
        about: data.bio,
        tags: data.tags,
        skills: data.skills,
        interests: data.interests,
        socialLinks: data.socialLinks,
        education: data.education,
        experience: data.experience,
        projects: data.projects,
    };

    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
}

export async function updateUserProfile(uid, data) {
    const payload = mapPayloadToBackend(data);
    const response = await api.put("/profile", payload);
    const normalized = normalizeUserResponse(response.data);

    return {
        ...data,
        ...normalized,
    };
}

export async function getUserProfile() {
    const response = await api.get("/profile");
    return normalizeUserResponse(response.data);
}

export async function getPublicProfile(username) {
    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
        throw new Error("username is required");
    }

    const response = await api.get(`/profile/public/${encodeURIComponent(normalizedUsername)}`);
    return normalizeUserResponse(response.data);
}

export async function getDiscoverProfiles() {
    const response = await api.get("/profile/discover");
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeUserResponse);
}

function normalizeEducationItem(item) {
    return {
        id: item?.id,
        collegeName: String(item?.collegeName || item?.institution || "").trim(),
        branch: String(item?.branch || item?.degree || item?.stream || "").trim(),
        fromYear: item?.fromYear,
        toYear: item?.toYear,
    };
}

function educationItemChanged(previousItem, nextItem) {
    const prev = normalizeEducationItem(previousItem);
    const next = normalizeEducationItem(nextItem);

    return (
        prev.collegeName !== next.collegeName ||
        prev.branch !== next.branch ||
        String(prev.fromYear ?? "") !== String(next.fromYear ?? "") ||
        String(prev.toYear ?? "") !== String(next.toYear ?? "")
    );
}

export async function getEducationList() {
    const response = await api.get("/profile/education");
    return Array.isArray(response.data) ? response.data : [];
}

export async function addEducationItem(payload) {
    const response = await api.post("/profile/education", payload);
    return response.data;
}

export async function updateEducationItem(educationId, payload) {
    const response = await api.put(`/profile/education/${educationId}`, payload);
    return response.data;
}

export async function deleteEducationItem(educationId) {
    const response = await api.delete(`/profile/education/${educationId}`);
    return response.data;
}

export async function syncEducationEntries(nextEducation = [], currentEducation = []) {
    const currentById = new Map(
        (Array.isArray(currentEducation) ? currentEducation : [])
            .filter((item) => item?.id)
            .map((item) => [item.id, item])
    );

    const nextById = new Map(
        (Array.isArray(nextEducation) ? nextEducation : [])
            .filter((item) => item?.id)
            .map((item) => [item.id, item])
    );

    const deleteRequests = [];
    for (const item of currentById.values()) {
        if (!nextById.has(item.id)) {
            deleteRequests.push(deleteEducationItem(item.id));
        }
    }

    const addRequests = [];
    const updateRequests = [];

    for (const item of Array.isArray(nextEducation) ? nextEducation : []) {
        if (!item?.id) {
            addRequests.push(addEducationItem(item));
            continue;
        }

        const previous = currentById.get(item.id);
        if (previous && educationItemChanged(previous, item)) {
            updateRequests.push(updateEducationItem(item.id, item));
        }
    }

    await Promise.all([...deleteRequests, ...addRequests, ...updateRequests]);

    return getEducationList();
}