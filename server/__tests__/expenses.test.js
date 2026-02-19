const request = require("supertest");
const path = require("path");
const fs = require("fs");

// Use the manual mock in src/__mocks__/db.js
jest.mock("../src/db");

process.env.NODE_ENV = "test";
const app = require("../src/index");
const { closeDb } = require("../src/db");

const TEST_DB = path.join(__dirname, "..", "test-expenses.db");

afterAll(() => {
    closeDb();
    // Give the DB a moment to release the file handle
    setTimeout(() => {
        if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    }, 100);
});

describe("POST /expenses", () => {
    it("creates a new expense and returns it with status 201", async () => {
        const res = await request(app)
            .post("/expenses")
            .set("Idempotency-Key", "test-key-1")
            .send({
                amount: 150.5,
                category: "Food",
                description: "Lunch at cafe",
                date: "2025-02-19",
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            amount: 150.5,
            category: "Food",
            description: "Lunch at cafe",
            date: "2025-02-19",
        });
        expect(res.body.id).toBeDefined();
        expect(res.body.created_at).toBeDefined();
    });

    it("returns the same expense when the idempotency key is reused", async () => {
        const key = "idempotent-test-key";

        const first = await request(app)
            .post("/expenses")
            .set("Idempotency-Key", key)
            .send({
                amount: 200,
                category: "Transport",
                description: "Cab ride",
                date: "2025-02-18",
            });

        const second = await request(app)
            .post("/expenses")
            .set("Idempotency-Key", key)
            .send({
                amount: 200,
                category: "Transport",
                description: "Cab ride",
                date: "2025-02-18",
            });

        expect(first.body.id).toBe(second.body.id);
        expect(second.status).toBe(200);
    });

    it("rejects a request with a negative amount", async () => {
        const res = await request(app)
            .post("/expenses")
            .send({
                amount: -50,
                category: "Shopping",
                description: "Nope",
                date: "2025-02-19",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.details).toContain(
            "amount must be greater than zero"
        );
    });

    it("rejects a request with missing required fields", async () => {
        const res = await request(app).post("/expenses").send({ amount: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error.details.length).toBeGreaterThanOrEqual(2);
    });
});

describe("GET /expenses", () => {
    it("returns all expenses", async () => {
        const res = await request(app).get("/expenses");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("filters expenses by category", async () => {
        await request(app)
            .post("/expenses")
            .set("Idempotency-Key", "filter-test-key")
            .send({
                amount: 75,
                category: "Entertainment",
                description: "Movie tickets",
                date: "2025-02-17",
            });

        const res = await request(app).get("/expenses?category=Entertainment");

        expect(res.status).toBe(200);
        expect(res.body.every((e) => e.category === "Entertainment")).toBe(true);
    });

    it("sorts expenses by date descending", async () => {
        const res = await request(app).get("/expenses?sort=date_desc");

        expect(res.status).toBe(200);
        for (let i = 1; i < res.body.length; i++) {
            expect(res.body[i - 1].date >= res.body[i].date).toBe(true);
        }
    });
});
