import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { BaseModal } from "../../ui";

function normalizeEducationItem(item = {}) {
    return {
        id: item?.id,
        collegeName: item?.collegeName || item?.institution || "",
        branch: item?.branch || item?.degree || item?.stream || "",
        fromYear: item?.fromYear || "",
        toYear: item?.toYear || "",
    };
}

export function EditModal({ title, type, items = [], onClose, onSave, theme }) {
    const normalizedItems = useMemo(() => {
        if (type !== "education") {
            return items;
        }

        return (items || []).map((item) => normalizeEducationItem(item));
    }, [items, type]);

    const [editItems, setEditItems] = useState(normalizedItems);

    useEffect(() => {
        setEditItems(normalizedItems);
    }, [normalizedItems]);

    const handleAddItem = () => {
        if (type === "education") {
            setEditItems([...editItems, { collegeName: "", branch: "", fromYear: "", toYear: "" }]);
        } else if (type === "experience") {
            setEditItems([...editItems, { company: "", role: "" }]);
        } else if (type === "projects") {
            setEditItems([...editItems, { title: "", description: "", liveLink: "", techStack: [] }]);
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
        if (type === "education") {
            const sanitized = editItems
                .map((item) => ({
                    id: item?.id,
                    collegeName: String(item?.collegeName || "").trim(),
                    branch: String(item?.branch || "").trim(),
                    fromYear: String(item?.fromYear || "").trim(),
                    toYear: String(item?.toYear || "").trim(),
                }))
                .filter((item) => item.collegeName && item.branch && item.fromYear && item.toYear);

            const hasInvalidRange = sanitized.some((item) => Number(item.fromYear) > Number(item.toYear));

            if (hasInvalidRange) {
                alert("From year cannot be greater than To year.");
                return;
            }

            onSave(sanitized);
            onClose();
            return;
        }

        if (type === "skills" || type === "interests") {
            const sanitized = editItems
                .map((item) => String(item || "").trim())
                .filter(Boolean);

            onSave(sanitized);
            onClose();
            return;
        }

        if (type === "experience") {
            const sanitized = editItems
                .map((item) => ({
                    company: String(item?.company || "").trim(),
                    role: String(item?.role || "").trim(),
                }))
                .filter((item) => item.company || item.role);

            onSave(sanitized);
            onClose();
            return;
        }

        if (type === "projects") {
            const sanitized = editItems
                .map((item) => ({
                    title: String(item?.title || "").trim(),
                    description: String(item?.description || "").trim(),
                    liveLink: String(item?.liveLink || item?.link || item?.url || "").trim(),
                    techStack: Array.isArray(item?.techStack)
                        ? item.techStack.map((entry) => String(entry || "").trim()).filter(Boolean)
                        : String(item?.techStack || "")
                            .split(",")
                            .map((entry) => entry.trim())
                            .filter(Boolean),
                }))
                .filter((item) => item.title || item.description || item.liveLink || item.techStack.length > 0);

            onSave(sanitized);
            onClose();
            return;
        }

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
                                                value={item.collegeName || ""}
                                                onChange={(e) => handleUpdateItem(index, "collegeName", e.target.value)}
                                                placeholder="College Name"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <input
                                                type="text"
                                                value={item.branch || ""}
                                                onChange={(e) => handleUpdateItem(index, "branch", e.target.value)}
                                                placeholder="Branch (e.g., CSE)"
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    min="1990"
                                                    max="2100"
                                                    value={item.fromYear || ""}
                                                    onChange={(e) => handleUpdateItem(index, "fromYear", e.target.value)}
                                                    placeholder="From year"
                                                    className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                                />
                                                <input
                                                    type="number"
                                                    min="1990"
                                                    max="2100"
                                                    value={item.toYear || ""}
                                                    onChange={(e) => handleUpdateItem(index, "toYear", e.target.value)}
                                                    placeholder="To year"
                                                    className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                                />
                                            </div>
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
                                            <textarea
                                                value={item.description || ""}
                                                onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                                                placeholder="Short project description"
                                                rows={3}
                                                className={`w-full rounded-lg border px-3 py-1 text-xs ${inputBgClass}`}
                                            />
                                            <input
                                                type="text"
                                                value={item.liveLink || item.link || item.url || ""}
                                                onChange={(e) => handleUpdateItem(index, "liveLink", e.target.value)}
                                                placeholder="Live link (https://...)"
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
