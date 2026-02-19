/**
 * Nice-to-have: shows total spending per category.
 */
export default function CategorySummary({ expenses }) {
    if (expenses.length === 0) return null;

    const totals = {};
    for (const exp of expenses) {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    }

    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    return (
        <div className="category-summary">
            <h3>Spending by Category</h3>
            <ul>
                {sorted.map(([cat, total]) => (
                    <li key={cat}>
                        <span className="category-badge" data-category={cat}>{cat}</span>
                        <span className="cat-total">₹{total.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
