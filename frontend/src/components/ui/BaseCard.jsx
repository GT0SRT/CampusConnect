export function BaseCard({
    as: Component = "article",
    className = "",
    children,
    onClick,
}) {
    return (
        <Component
            onClick={onClick}
            className={`rounded-xl border p-4 transition ${className}`}
        >
            {children}
        </Component>
    );
}
