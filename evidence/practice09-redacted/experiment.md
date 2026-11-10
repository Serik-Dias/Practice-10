# Local AI review, two checkpoints

Both reviews were written by Codex (GPT-6) in the same session using the repaired Practice 08 files. The student chose a local submission. These are local responses to the prompts below. Bolt transcripts and independent model runs are outside this comparison.

## A · Before supplying the project instructions

**Prompt A.** Inspect the existing Smart Campus checker. Locate its rules, UI, fixtures and tests. Identify one maintainability problem. Recommend at most two justified patterns, describe how to verify the change, and leave the files untouched.

**Local response A.** The Boolean rule is already in src/booking.js. The React form, fixed clock and frozen sample booking live in src/App.jsx. The unit cases are in src/booking.test.js and the screen-level checks are in src/App.test.jsx. The form repeats the finite-time, interval-order, past-time, duration and blocked checks to choose a message after asking the rules for a Boolean. A future policy edit could change the verdict while leaving the old message on screen. Give the existing rule module a way to report its first failure and have the form translate that reason into text. Keep canBook for Boolean callers. Compare both the decision and the visible message when two failures apply. There is one policy and one fixture format.

## B · After explicitly reading AGENTS.md

**Prompt B.** Read the root AGENTS.md. Summarize its constraints and exact verification commands. Inspect the same Smart Campus files, recommend at most two justified patterns and specify how you would test the change. Leave the files untouched during review.

**Local response B.** Keep one fictional room and a fixed clock. The Boolean API must reject invalid, past, overlong, blocked and overlapping requests, permit touching endpoints and preserve the input data. The form must keep the same text and priority when more than one rule fails. Work inside the existing booking module and return the first rejection reason to the UI. Derive canBook from that same decision. Keep the JSX layout and the sample fixture. Add form cases for a reversed, past or overlong request in a blocked room and for a blocked request that overlaps. Run npm ci, npm test and npm run build. Use npm run dev to compare desktop and mobile results.

| Review criterion | A | B |
|---|---|---|
| Scope | Targets duplicated conditions | Identifies the Boolean API, UI text and fixture as explicit compatibility requirements |
| Extra patterns | Proposes one module boundary | Uses the same module boundary |
| Tests | Requests a multiple-failure check | Names specific competing conditions and verification commands |
| Clarity | Explains how verdict and feedback could diverge | Separates the rule decision from the displayed wording |

The principal recommendation was the same at both checkpoints. Reading the instructions made the review easier to turn into a concrete test plan. Both reviews share an author and context, so their differences cannot establish an improvement caused by the file alone. The local agent read the file explicitly. No Bolt recommendation or automatic instruction loading was observed.
