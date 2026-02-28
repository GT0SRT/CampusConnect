import { useState } from "react";
import { Brain, Zap, Clock, Hash, Building2, Briefcase, BookOpen } from "lucide-react";

const AssessmentSetup = ({ onStart, loading }) => {
  const [form, setForm] = useState({
    company: "",
    role_name: "",
    topics: "",
    difficulty: "moderate",
    noOfQuestions: 5,
    totalTime: 300,
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "rgba(0, 234, 255, 0.15)",   // soft cyan
              border: "1px solid rgba(0, 234, 255, 0.3)"
            }}
          >
            <Brain className="w-4 h-4" style={{ color: "#00eaff" }} />
            <span className="text-sm font-medium" style={{ color: "#000" }}>
              AI Assessment
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Configure Your Assessment</span>
          </h1>
          <p className="text-muted-foreground">Set up parameters to generate AI-powered questions</p>
        </div>

        {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.6)",     // soft white card
              border: "1px solid rgba(0, 0, 0, 0.1)",      // light border
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",    // soft shadow
              backdropFilter: "blur(10px)",                // glass subtle effect
            }}
          >

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" style={{ color: "#00eaff" }} /> Company
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="e.g. Tech Company"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" style={{ color: "#00eaff" }} /> Role Name
            </label>
            <input
              type="text"
              required
              value={form.role_name}
              onChange={(e) => update("role_name", e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: "#00eaff" }} /> Topics
            </label>
            <input
              type="text"
              required
              value={form.topics}
              onChange={(e) => update("topics", e.target.value)}
              placeholder="e.g. General, DSA, React"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#00eaff" }} /> Difficulty
            </label>
            <div className="flex gap-2">
              {["easy", "moderate", "hard"].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => update("difficulty", d)}
                  style={form.difficulty === d ? {
                    background: "linear-gradient(90deg, #00eaff, #00c3ff)"
                  } : {}}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    form.difficulty === d
                      ? "text-black"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Questions & Time */}
          <div className="grid grid-cols-2 gap-4">

            {/* Number of questions */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-4 h-4" style={{ color: "#00eaff" }} /> Questions
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={form.noOfQuestions}
                onChange={(e) =>
                  update("noOfQuestions", parseInt(e.target.value) || 1)
                }
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "#00eaff" }} /> Time (seconds)
              </label>
              <input
                type="number"
                min={60}
                required
                value={form.totalTime}
                onChange={(e) =>
                  update("totalTime", parseInt(e.target.value) || 60)
                }
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-semibold text-primary-foreground transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #00eaff, #00c3ff)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Assessment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssessmentSetup;