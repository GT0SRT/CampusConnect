import { DefaultTabList } from "../../ui/DefaultTabList";
import { EmptyRow } from "../../ui/EmptyRow";

export function CardRenderer({
    items,
    renderFunction,
    emptyText,
    maxHeightClass,
    expandedCardId,
    setExpandedCardId,
    theme,
    cardType,
}) {
    const fadeOverlayTone =
        theme === "dark"
            ? "from-slate-900 to-transparent"
            : "from-white to-transparent";

    if (!items.length)
        return <EmptyRow text={emptyText} theme={theme} />;

    if (!renderFunction)
        return <DefaultTabList items={items} emptyText={emptyText} theme={theme} />;

    const isCompactGrid = cardType === "post" || cardType === "saved-post";
    const isExpanded = expandedCardId === cardType;

    const renderViewToggle = () => {
        if (!maxHeightClass) return null;

        if (!isExpanded) {
            return (
                <div className={`absolute bottom-0 left-0 right-0 flex items-end justify-center bg-linear-to-t ${fadeOverlayTone} pb-2 pt-6`}>
                    <button
                        type="button"
                        onClick={() => setExpandedCardId(cardType)}
                        className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition"
                    >
                        View more
                    </button>
                </div>
            );
        }

        return (
            <button
                type="button"
                onClick={() => setExpandedCardId(null)}
                className="mt-2 w-full text-xs font-semibold text-slate-400 hover:text-slate-300 transition"
            >
                Show less
            </button>
        );
    };

    if (isCompactGrid) {
        return (
            <div>
                <div className={`relative ${isExpanded ? "" : maxHeightClass}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {items.map((item, index) => {
                            const cardId = `${cardType}-${item?.id ?? index}`;
                            return <div key={cardId}>{renderFunction(item)}</div>;
                        })}
                    </div>
                    {!isExpanded ? renderViewToggle() : null}
                </div>
                {isExpanded ? renderViewToggle() : null}
            </div>
        );
    }

    return (
        <div>
            <div className={`relative ${isExpanded ? "" : maxHeightClass}`}>
                <div className="space-y-2">
                    {items.map((item, index) => {
                        const cardId = `${cardType}-${item?.id ?? index}`;
                        return <div key={cardId}>{renderFunction(item)}</div>;
                    })}
                </div>
                {!isExpanded ? renderViewToggle() : null}
            </div>
            {isExpanded ? renderViewToggle() : null}
        </div>
    );
}
