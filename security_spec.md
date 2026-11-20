# Security Specification — Mi Agenda de Aprendizaje

## 1. Data Invariants
1. **Strict Ownership**: Every document in `/users/{userId}`, `/users/{userId}/classes/{classId}`, `/users/{userId}/tasks/{taskId}`, and `/users/{userId}/notes/{noteId}` belongs strictly to the authenticated, email-verified user whose `request.auth.uid == userId`.
2. **Master Gate Parent Link**: No class, task, or note can be created or updated unless the parent `/users/{userId}` document exists in Firestore.
3. **Immutable Ownership & Timestamps**: `ownerId`, `id`, and `createdAt` cannot change after document creation. `createdAt` and `updatedAt` must equal `request.time`.
4. **Strict Schema & Size Bounds**: Unknown ("ghost") fields are rejected via `keys().hasAll(...)` and `keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update. All strings have explicit `.size()` bounds and regex checks on IDs, dates (`YYYY-MM-DD`), and times (`HH:MM`).
5. **No Blanket Reads or Queries**: `list` on subcollections verifies `resource.data.ownerId == request.auth.uid` and `request.auth.uid == userId`. Top-level `/users` listing is denied.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Cross-Tenant Read**: User B attempts `get(/users/userA/tasks/task_1)`.
2. **Cross-Tenant Create**: User B attempts `create(/users/userA/tasks/task_x)` with `ownerId: "userB"`.
3. **Owner Spoofing**: User B attempts `create(/users/userB/tasks/task_x)` with `ownerId: "userA"`.
4. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create a task.
5. **Ghost Field Injection (Shadow Write)**: User A sends `{ ..., isAdmin: true }` when creating a note.
6. **Ghost Field Injection (Shadow Update)**: User A sends `{ title: "Ok", updatedAt: request.time, secretFlag: 1 }` on update.
7. **ID Poisoning**: User A tries to write a task at `/users/userA/tasks/invalid$id!with*bad#chars` or 500-char ID.
8. **Payload Exhaustion (Denial of Wallet)**: User A sends a 10,000-character string in `CourseNote.content` (limit 5000).
9. **Fake Client Timestamp**: User A sets `createdAt` to a past timestamp (`2020-01-01`) instead of `request.time`.
10. **Immutable Field Mutation**: User A tries to change `ownerId` or `createdAt` during an update.
11. **Invalid Date Format**: User A creates a class with `date: "17/11/2026"` instead of `YYYY-MM-DD`.
12. **Blanket User Directory Scraping**: User A attempts `list(/users)` to enumerate all student accounts.
