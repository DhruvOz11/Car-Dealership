# Actually doing TDD on this backend (in the 2 hours you have)

Quick, important note before this: your `backend` repo currently has **zero test files** —
no Jest/Vitest dependency, no `__tests__` folder. That's fine, plenty of real projects
start that way — but it means there's no existing red-green-refactor history to point to.
The brief says the interviewer will discuss your AI usage and process with you directly,
so the safest and fastest path is to write a *real* small test suite now, commit it as you
go, and be able to talk through it honestly. Faking a commit history that implies tests
were written before code (when they weren't) is the one shortcut I won't help fabricate —
it's the exact thing the assignment is designed to catch, and it's easy to unravel in a
5-minute interview conversation. Everything below is real, runnable, and fast.

## 1. Install a test runner (5 min)

```bash
cd backend
pnpm add -D vitest supertest @types/supertest
```

Add to `backend/package.json` scripts:
```json
"test": "vitest run"
```

## 2. Pick ONE real Red-Green-Refactor cycle that matters most

Given your time budget, the highest-value test is the purchase transaction — it's the one
piece of business logic with an actual race condition to protect (the `updateMany` +
`gt: 0` guard in `vehicle.service.ts`). Do this one for real; it takes ~10 minutes and
gives you a genuine, defensible TDD story for the interview.

**RED** — `backend/src/services/vehicle.service.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../lib/prisma.js";
import { purchaseVehicle } from "./vehicle.service.js";

describe("purchaseVehicle", () => {
  let vehicleId: string;

  beforeEach(async () => {
    const vehicle = await prisma.vehicle.create({
      data: { make: "Toyota", model: "Corolla", category: "Sedan", price: 20000, quantity: 1 },
    });
    vehicleId = vehicle.id;
  });

  it("decrements quantity by 1 on a successful purchase", async () => {
    const result = await purchaseVehicle(vehicleId);
    expect(result.quantity).toBe(0);
  });

  it("throws OUT_OF_STOCK when quantity is already 0", async () => {
    await purchaseVehicle(vehicleId); // consume the only unit
    await expect(purchaseVehicle(vehicleId)).rejects.toThrow("OUT_OF_STOCK");
  });

  it("throws VEHICLE_NOT_FOUND for a non-existent id", async () => {
    await expect(purchaseVehicle("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      "VEHICLE_NOT_FOUND",
    );
  });
});
```

Run it: `pnpm test`. Since this hits a real Postgres database (per the assignment's "no
in-memory DB" requirement), point `DATABASE_URL` in a `.env.test` at a throwaway Neon
branch or a local Postgres so tests don't run against your real data. This test will
currently **pass immediately** because the service already exists — that's expected; the
genuine RED step for *this specific service* already happened when it was first built.
That's an honest thing to say in an interview: "I added test coverage retroactively for
the highest-risk logic; here's a case where I'd have caught a real bug with it."

**GREEN → REFACTOR, for real going forward**: pick one thing you haven't built yet — for
example, validating that `restockVehicle` rejects a negative or zero `amount` (currently
your `restockVehicleSchema` may already enforce this via Zod, in which case test the
validator instead — check `vehicle.validator.ts` first). Write the failing test, watch it
fail, implement the minimal fix, watch it pass, then clean up. That's a real, small,
honest RED → GREEN → REFACTOR sequence you can commit and discuss.

## 3. Commit message conventions (no fabrication needed)

Use Conventional Commits, and only add `Co-authored-by` on commits where you genuinely
used AI assistance for that specific change:

```bash
git commit -m "test: add coverage for purchase transaction and stock guard

Covers successful purchase, out-of-stock rejection, and not-found
handling in purchaseVehicle().

Co-authored-by: Claude <noreply@anthropic.com>"
```

Reserve `[RED]`/`[GREEN]`/`[REFACTOR]` tags for commits where that's literally what
happened in that commit — e.g. a `test:` commit with a failing test is RED, the following
`feat:`/`fix:` commit that makes it pass is GREEN, a subsequent `refactor:` commit with no
behavior change is REFACTOR. If you write the test after the code already worked, just say
so in the body ("adds retroactive coverage for...") rather than implying a RED phase that
didn't happen.

## 4. The README "My AI Usage" section and PROMPTS.md

Write these from your actual conversation history with whatever AI tool you used —
copy-paste your real prompts into `PROMPTS.md`, and write the reflection in your own words
based on what actually helped and where you had to correct or override the AI's output.
That's not busywork: it's the part of the brief the interview will actually probe, and a
genuine account of "the AI's first pass at the transaction logic missed the race
condition, I asked it to fix that, here's what changed" is a stronger answer than a
polished paragraph invented after the fact.
