/**
 * Displays a table of expenses and a total row at the bottom.
 */
export default function ExpenseList({ expenses, loading }) {
    if (loading) {
        return <p className="loading-text">Loading expenses...</p>;
    }

    if (expenses.length === 0) {
        return <p className="empty-text">No expenses yet. Add one above!</p>;
    }

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="expense-list">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th className="amount-col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((exp) => (
                        <tr key={exp.id}>
                            <td>{formatDate(exp.date)}</td>
                            <td>
                                <span className="category-badge" data-category={exp.category}>{exp.category}</span>
                            </td>
                            <td>{exp.description}</td>
                            <td className="amount-col">₹{exp.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="total-row">
                        <td colSpan="3">Total</td>
                        <td className="amount-col">₹{total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
