import { useState } from "react";
import { Brain, Zap, Clock, Hash, Building2, Briefcase, BookOpen } from "lucide-react";
import { useUserStore } from "../../store/useUserStore";

const AssessmentSetup = ({ onStart, loading, historyLoading = false, latestAssessment = null }) => {
  const theme = useUserStore((state) => state.theme);
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
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
      <div className={`w-full max-w-3xl mx-auto animate-fade-in-up ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI Assessment
            </span>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            <span className="gradient-text">Configure Your Assessment</span>
          </h1>
          <p className="text-muted-foreground">Set up parameters to generate AI-powered questions</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 rounded-2xl">

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Company
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
              <Briefcase className="w-4 h-4 text-primary" /> Role Name
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
              <BookOpen className="w-4 h-4 text-primary" /> Topics
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
              <Zap className="w-4 h-4 text-primary" /> Difficulty
            </label>
            <div className="flex gap-2">
              {["easy", "moderate", "hard"].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => update("difficulty", d)}
                  style={form.difficulty === d ? { background: "linear-gradient(90deg, #00eaff, #00c3ff)" } : {}}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${form.difficulty === d
                    ? `${theme === "dark" ? "text-white" : "text-black"}`
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
                <Hash className="w-4 h-4 text-primary" /> Questions
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
                <Clock className="w-4 h-4 text-primary" /> Time (seconds)
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
            className={`w-full py-3.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${theme === "dark" ? "text-white" : "text-black"}`}
            style={{ background: "linear-gradient(90deg, #00eaff, #00c3ff)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className={`w-4 h-4 border-2 rounded-full animate-spin ${theme === "dark" ? "border-white/40 border-t-white" : "border-black/40 border-t-black"}`} />
                Generating...
              </span>
            ) : (
              "Generate Assessment"
            )}
          </button>

          {(historyLoading || latestAssessment) && (
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
              {historyLoading ? (
                <p className="text-muted-foreground">Loading your latest assessment...</p>
              ) : (
                <p className="text-muted-foreground">
                  Last: <span className="text-foreground font-medium">{latestAssessment?.company}</span>
                  {" • "}
                  <span className="text-foreground font-medium">{latestAssessment?.role_name}</span>
                  {" • Score: "}
                  <span className="text-foreground font-medium">{latestAssessment?.overallScore}</span>
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AssessmentSetup;