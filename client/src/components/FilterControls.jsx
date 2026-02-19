const CATEGORIES = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Other",
];

/**
 * Controls for filtering by category and toggling date sort.
 */
export default function FilterControls({
    category,
    onCategoryChange,
    sortDesc,
    onSortChange,
}) {
    return (
        <div className="filter-controls">
            <div className="filter-group">
                <label htmlFor="filter-category">Filter by category</label>
                <select
                    id="filter-category"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="sort-toggle">Sort by date</label>
                <button
                    id="sort-toggle"
                    className={`sort-btn ${sortDesc ? "active" : ""}`}
                    onClick={() => onSortChange(!sortDesc)}
                    type="button"
                >
                    {sortDesc ? "↓ Newest first" : "↑ Oldest first"}
                </button>
            </div>
        </div>
    );
}
