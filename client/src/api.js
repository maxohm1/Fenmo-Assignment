const API_BASE = "http://localhost:3001";

/**
 * Fetch all expenses, with optional category filter and sort.
 */
export async function fetchExpenses({ category, sort } = {}) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);

    const url = `${API_BASE}/expenses${params.toString() ? "?" + params : ""}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || "Failed to fetch expenses");
    }

    return res.json();
}

/**
 * Create a new expense.
 * Sends an Idempotency-Key header so retries don't create duplicates.
 */
export async function createExpense(data, idempotencyKey) {
    const res = await fetch(`${API_BASE}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
            body.error?.details?.join(", ") || body.error?.message || "Failed to create expense"
        );
    }

    return res.json();
}
