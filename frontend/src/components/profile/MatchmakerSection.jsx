import { useState, useEffect } from "react";
import { updateUserProfile } from "../../services/userService";
import { useUserStore } from "../../store/useUserStore";

const lookingForOptions = [
  "Study Buddy",
  "Hackathon Team",
  "Startup Partner",
  "Project Collaborator",
  "Club Members"
];

const MatchmakerSection = ({ userProfile }) => {
  const { user ,updateUser } = useUserStore();
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [openToConnect, setOpenToConnect] = useState(true);
  const [inputInterest, setInputInterest] = useState("");
  const [inputSkill, setInputSkill] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("UserProfile from props:", userProfile);
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
        openToConnect
      });
      updateUser({
        interests,
        skills,
        lookingFor,
        openToConnect
      });

      alert("Matchmaker preferences updated!");
    } catch (error) {
      console.error(error);
      alert("Error updating preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">
        Matchmaker Preferences
      </h2>

      {/* Interests */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Interests</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputInterest}
            onChange={(e) => setInputInterest(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Add interest"
          />
          <button onClick={handleAddInterest} className="px-3 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((item, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputSkill}
            onChange={(e) => setInputSkill(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Add skill"
          />
          <button onClick={handleAddSkill} className="px-3 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((item, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Looking For */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Looking For</label>
        <div className="flex flex-wrap gap-3">
          {lookingForOptions.map((option) => (
            <label key={option} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={lookingFor.includes(option)}
                onChange={() => handleLookingForChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Open to Connect */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={openToConnect}
            onChange={() => setOpenToConnect(!openToConnect)}
          />
          Open to Connect
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
};

export default MatchmakerSection;
