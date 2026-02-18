import { getUserById, mockUsers } from "../data/mockData";

export async function updateUserProfile() {
    return { success: true };
}

export async function getUserProfile(uid) {
    return getUserById(uid) || mockUsers[0];
}