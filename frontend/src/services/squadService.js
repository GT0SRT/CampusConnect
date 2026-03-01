import api from "./api";

export async function getSquadState() {
    const response = await api.get("/squads/state");
    return response.data || { squads: [], chatsByMemberId: {} };
}

export async function saveSquadState(payload) {
    const response = await api.put("/squads/state", payload || { squads: [], chatsByMemberId: {} });
    return response.data || { squads: [], chatsByMemberId: {} };
}
