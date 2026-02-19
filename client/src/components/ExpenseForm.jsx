import { useState } from "react";

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
 * A form to add a new expense.
 *
 * Generates a unique idempotency key per submission attempt
 * and disables the submit button while a request is in flight,
 * so rapid clicks or page reloads won't create duplicates.
 */
export default function ExpenseForm({ onSubmit }) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(today());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Client-side validation
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) {
            setError("Please enter a valid positive amount");
            return;
        }

        // Generate a fresh idempotency key for this submission
        const idempotencyKey = crypto.randomUUID();

        setLoading(true);
        try {
            await onSubmit(
                {
                    amount: amt,
                    category,
                    description: description.trim(),
                    date,
                },
                idempotencyKey
            );

            // Reset form on success
            setAmount("");
            setDescription("");
            setDate(today());
            setSuccess("Expense added successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <h2>Add Expense</h2>

            <div className="form-row">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="description">Description</label>
                <input
                    id="description"
                    type="text"
                    placeholder="What was this expense for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="date">Date</label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
            </button>
        </form>
    );
}

function today() {
    return new Date().toISOString().split("T")[0];
}
