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
    if (!items.length)
        return <EmptyRow text={emptyText} theme={theme} />;

    if (!renderFunction)
        return <DefaultTabList items={items} emptyText={emptyText} theme={theme} />;

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                const cardId = `${cardType}-${item?.id ?? index}`;
                const isExpanded = expandedCardId === cardId;

                return (
                    <div key={cardId} className={`relative ${isExpanded ? "" : maxHeightClass}`}>
                        {renderFunction(item)}
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center bg-linear-to-t from-slate-900 to-transparent pb-2 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setExpandedCardId(cardId)}
                                    className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition"
                                >
                                    View more
                                </button>
                            </div>
                        )}
                        {isExpanded && (
                            <button
                                type="button"
                                onClick={() => setExpandedCardId(null)}
                                className="mt-2 w-full text-xs font-semibold text-slate-400 hover:text-slate-300 transition"
                            >
                                Show less
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
