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
  const { user, updateUser, theme } = useUserStore();
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
    <div className={`space-y-4 p-4 rounded-lg border transition-colors ${theme === 'dark'
      ? 'bg-slate-800/40 border-slate-700/50'
      : 'bg-white/40 border-gray-200/50'
      }`}>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
        Matchmaker Preferences
      </h3>

      {/* Interests */}
      <div className="space-y-2">
        <label className={`block font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Interests</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputInterest}
            onChange={(e) => setInputInterest(e.target.value)}
            className={`flex-1 p-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'bg-slate-900/60 border-slate-600/50 text-slate-100 placeholder-slate-400'
              : 'bg-white/60 border-gray-300 text-slate-900 placeholder-gray-400'
              }`}
            placeholder="Add interest"
          />
          <button
            onClick={handleAddInterest}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${theme === 'dark'
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                : 'bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100/70 border border-cyan-200/50'
              }`}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((item, index) => (
            <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${theme === 'dark'
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                : 'bg-gray-200/60 text-slate-700 border border-gray-300/50'
              }`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className={`block font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputSkill}
            onChange={(e) => setInputSkill(e.target.value)}
            className={`flex-1 p-2 rounded-lg border transition-colors ${theme === 'dark'
              ? 'bg-slate-900/60 border-slate-600/50 text-slate-100 placeholder-slate-400'
              : 'bg-white/60 border-gray-300 text-slate-900 placeholder-gray-400'
              }`}
            placeholder="Add skill"
          />
          <button
            onClick={handleAddSkill}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${theme === 'dark'
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                : 'bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100/70 border border-cyan-200/50'
              }`}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((item, index) => (
            <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${theme === 'dark'
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                : 'bg-gray-200/60 text-slate-700 border border-gray-300/50'
              }`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Looking For */}
      <div className="space-y-2">
        <label className={`block font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Looking For</label>
        <div className="flex flex-wrap gap-4">
          {lookingForOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lookingFor.includes(option)}
                onChange={() => handleLookingForChange(option)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Open to Connect */}
      <div className="pt-2 border-t" style={{
        borderColor: theme === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(229, 231, 235, 0.5)'
      }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={openToConnect}
            onChange={() => setOpenToConnect(!openToConnect)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Open to Connect</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${theme === 'dark'
            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 disabled:opacity-50'
            : 'bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100/70 border border-cyan-200/50 disabled:opacity-50'
          }`}
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
};

export default MatchmakerSection;
