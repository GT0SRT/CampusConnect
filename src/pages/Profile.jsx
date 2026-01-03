import { useState } from "react";
import { profile } from "../data/profile";

const tabs = ["Posts", "Threads", "Saved", "Settings"];

export default function Profile() {
  const [active, setActive] = useState("Posts");

  return (
    <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* Header */}
      <div className="bg-white rounded-xl p-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-300"></div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="text-sm text-gray-500">
            {profile.username} · {profile.college}
          </p>

          <div className="flex gap-6 mt-4">
            <Stat label="Posts" value={profile.stats.posts} />
            <Stat label="Threads" value={profile.stats.threads} />
            <Stat label="Karma" value={profile.stats.karma} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              active === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === "Posts" && (
        <div className="grid grid-cols-3 gap-2">
          {profile.posts.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="aspect-square object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {active === "Threads" && (
        <div className="bg-white rounded-xl p-6 text-gray-500">
          User threads will appear here
        </div>
      )}

      {active === "Saved" && (
        <div className="bg-white rounded-xl p-6 text-gray-500">
          Saved posts & threads
        </div>
      )}

      {active === "Settings" && <Settings />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <Toggle label="Dark Mode" />
      <Toggle label="Private Account" />
      <button className="text-red-600 text-sm font-medium">Logout</button>
    </div>
  );
}

function Toggle({ label }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium">{label}</p>
      <div className="w-10 h-5 bg-gray-300 rounded-full"></div>
    </div>
  );
}