import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BaseModal } from "../../ui";

export function EditModal({ title, type, items = [], onClose, onSave, theme }) {
    const [editItems, setEditItems] = useState(items);

    const handleAddItem = () => {
        if (type === "education") {
            setEditItems([...editItems, { institution: "", years: "" }]);
        } else if (type === "experience") {
            setEditItems([...editItems, { company: "", role: "" }]);
        } else if (type === "projects") {
            setEditItems([...editItems, { title: "", techStack: [] }]);
        } else if (type === "skills" || type === "interests") {
            setEditItems([...editItems, ""]);
        }
    };

    const handleDeleteItem = (index) => {
        setEditItems(editItems.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index, field, value) => {
        const updated = [...editItems];
        if (typeof updated[index] === "string") {
            updated[index] = value;
        } else {
            updated[index][field] = value;
        }
        setEditItems(updated);
    };

    const handleConfirmSave = () => {
        onSave(editItems);
        onClose();
    };

    const inputBgClass =
        theme === "dark"
            ? "bg-slate-800 text-slate-50 border-slate-700"
            : "bg-slate-50 text-slate-900 border-slate-300";

    return (
        <BaseModal
            open
            onClose={onClose}
            title={`Edit ${title}`}
            theme={theme}
            maxWidthClass="max-w-md"
            contentClassName="max-h-[28rem] overflow-y-auto p-6"
        >

            <div className="mb-4 max-h-72 space-y-3 overflow-y-auto">
                {editItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                        {type === "skills" || type === "interests" ? (
                            <>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleUpdateItem(index, null, e.target.value)}
                                    placeholder="Enter item"
                                    className={`flex-1 rounded-lg border px-3 py-2 text-xs ${inputBgClass}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteItem(index)}
                                    className="text-red-400 transition hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 space-y-1.5">
                                    {type === "education" && (
                                        <>
                                            <input
                                                type="text"
                                                value={item.institution || ""}
                                                onChange={(e) => handleUpdateItem(index, "institution", e.target.value)}
                                                placeholder="Institution"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <input
                                                type="text"
                                                value={item.years || ""}
                                                onChange={(e) => handleUpdateItem(index, "years", e.target.value)}
                                                placeholder="Years (e.g., 2022 - 2026)"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                        </>
                                    )}
                                    {type === "experience" && (
                                        <>
                                            <input
                                                type="text"
                                                value={item.company || ""}
                                                onChange={(e) => handleUpdateItem(index, "company", e.target.value)}
                                                placeholder="Company"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <input
                                                type="text"
                                                value={item.role || ""}
                                                onChange={(e) => handleUpdateItem(index, "role", e.target.value)}
                                                placeholder="Role"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                        </>
                                    )}
                                    {type === "projects" && (
                                        <>
                                            <input
                                                type="text"
                                                value={item.title || ""}
                                                onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                                                placeholder="Project Title"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <input
                                                type="text"
                                                value={Array.isArray(item.techStack) ? item.techStack.join(", ") : ""}
                                                onChange={(e) => handleUpdateItem(index, "techStack", e.target.value.split(",").map((t) => t.trim()))}
                                                placeholder="Tech Stack (comma-separated)"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                        </>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteItem(index)}
                                    className="text-red-400 transition hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handleAddItem}
                className={`mb-4 w-full rounded-lg border-2 border-dashed px-3 py-2 text-xs font-medium transition hover:opacity-80 ${theme === "dark"
                    ? "border-slate-600 text-slate-300 hover:border-slate-500"
                    : "border-slate-300 text-slate-600 hover:border-slate-200"
                    }`}
            >
                + Add {type === "skills" ? "Skill" : type === "interests" ? "Interest" : "Item"}
            </button>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${theme === "dark"
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100"
                        }`}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirmSave}
                    className="flex-1 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/30"
                >
                    Save Changes
                </button>
            </div>
        </BaseModal>
    );
}
