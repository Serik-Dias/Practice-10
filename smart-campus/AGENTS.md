# Smart Campus room availability

A student checks one fictional room on a fixed day. The React form and frozen demo fixture (now 540, booking 600–660) are in src/App.jsx. The shared, pure decision belongs in src/booking.js. The two existing test files cover the rules and form. Keep the Boolean canBook(input) interface.

## Rules
- AC1 requires finite numeric minutes, 0 ≤ start < end ≤ 1440 and start strictly after now. The end field accepts 24:00.
- AC2 permits 120 minutes and rejects 121. AC3 rejects a blocked room.
- AC4 treats bookings as half-open intervals. An actual overlap conflicts. Touching at either endpoint is allowed.
- AC5 preserves booking contents, object identities and order. Checking never creates a reservation.
- AC6 preserves the labels, feedback wording and priority, and desktop and mobile layout.
- Keep the existing scope. Exclude login, backend, storage and extra policies. Use at most two justified patterns. Prefer a small pure function. A single fixture shape needs no Adapter.

## Commands
From this directory, install dependencies with npm ci. Run npm test for the full suite, npm run build for a production build and npm run dev for the local preview. Keep every existing assertion. Add focused regression cases for behavior touched by the refactor. Report the files changed, the reason for each change and the observed test results. Explicitly read this file before editing.
