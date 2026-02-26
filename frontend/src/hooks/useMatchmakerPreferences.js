import { useEffect, useState } from "react";
import { updateUserProfile } from "../services/userService";
import { useUserStore } from "../store/useUserStore";

export function useMatchmakerPreferences(userProfile) {
    const { user, updateUser } = useUserStore();
    const [interests, setInterests] = useState([]);
    const [skills, setSkills] = useState([]);
    const [lookingFor, setLookingFor] = useState([]);
    const [openToConnect, setOpenToConnect] = useState(true);
    const [inputInterest, setInputInterest] = useState("");
    const [inputSkill, setInputSkill] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setInterests(userProfile.interests || []);
            setSkills(userProfile.skills || []);
            setLookingFor(userProfile.lookingFor || []);
            setOpenToConnect(userProfile.openToConnect ?? true);
        }
    }, [userProfile]);

    const handleAddInterest = () => {
        if (inputInterest.trim()) {
            setInterests([...interests, inputInterest.trim()]);
            setInputInterest("");
        }
    };

    const handleAddSkill = () => {
        if (inputSkill.trim()) {
            setSkills([...skills, inputSkill.trim()]);
            setInputSkill("");
        }
    };

    const handleLookingForChange = (option) => {
        if (lookingFor.includes(option)) {
            setLookingFor(lookingFor.filter((item) => item !== option));
        } else {
            setLookingFor([...lookingFor, option]);
        }
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        try {
            setLoading(true);
            await updateUserProfile(user.uid, {
                interests,
                skills,
                lookingFor,
                openToConnect,
            });
            updateUser({
                interests,
                skills,
                lookingFor,
                openToConnect,
            });
            alert("Matchmaker preferences updated!");
        } catch (error) {
            console.error(error);
            alert("Error updating preferences");
        } finally {
            setLoading(false);
        }
    };

    return {
        interests,
        skills,
        lookingFor,
        openToConnect,
        inputInterest,
        setInputInterest,
        inputSkill,
        setInputSkill,
        loading,
        handleAddInterest,
        handleAddSkill,
        handleLookingForChange,
        setOpenToConnect,
        handleSave,
    };
}
