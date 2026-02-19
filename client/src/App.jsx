import { useState, useEffect, useCallback } from "react";
import { fetchExpenses, createExpense } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import FilterControls from "./components/FilterControls";
import CategorySummary from "./components/CategorySummary";
import "./App.css";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchExpenses({
        category: category || undefined,
        sort: sortDesc ? "date_desc" : undefined,
      });
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, sortDesc]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function handleAddExpense(data, idempotencyKey) {
    await createExpense(data, idempotencyKey);
    await loadExpenses();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p className="subtitle">Track your spending, understand your habits</p>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <ExpenseForm onSubmit={handleAddExpense} />
          <CategorySummary expenses={expenses} />
        </aside>

        <section className="content">
          <FilterControls
            category={category}
            onCategoryChange={setCategory}
            sortDesc={sortDesc}
            onSortChange={setSortDesc}
          />
          {error && <p className="api-error">⚠ {error}</p>}
          <ExpenseList expenses={expenses} loading={loading} />
        </section>
      </main>
    </div>
  );
}
