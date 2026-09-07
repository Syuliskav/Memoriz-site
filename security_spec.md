# Security Specification & ABAC Security Model

## 1. Data Invariants
1. A user profile document `/users/{userId}` can ONLY be read or written by the authenticated user whose `request.auth.uid == userId`.
2. Anonymous users are rejected from writing to user profiles or sync documents.
3. The `userId` property within the incoming document must strictly match `request.auth.uid`.
4. Sub-collection documents `/users/{userId}/sync/{syncId}` can ONLY be read, created, or updated by the authenticated user whose `request.auth.uid == userId`.
5. Cross-user reading or modifications are strictly forbidden (Zero-Trust isolation).
6. Catch-all default deny `match /{document=**} { allow read, write: if false; }` prevents any unauthorized access to unmapped collections.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Read on Profile**: `GET /users/user123` with `auth == null` -> DENIED.
2. **Unauthenticated Write on Profile**: `POST /users/user123` with `auth == null` -> DENIED.
3. **Identity Spoofing on Profile Create**: User `attacker` attempts `SET /users/victim` with `userId: 'victim'` -> DENIED.
4. **UID Field Mismatch**: User `user1` attempts `SET /users/user1` with `userId: 'user2'` -> DENIED.
5. **Cross-User Profile Update**: User `user1` attempts `UPDATE /users/user2` -> DENIED.
6. **Cross-User Profile Delete**: User `user1` attempts `DELETE /users/user2` -> DENIED.
7. **Unauthenticated Sync Data Read**: `GET /users/user123/sync/progress` with `auth == null` -> DENIED.
8. **Cross-User Sync Data Create**: User `attacker` attempts `SET /users/victim/sync/progress` -> DENIED.
9. **Cross-User Sync Data Read**: User `attacker` attempts `GET /users/victim/sync/progress` -> DENIED.
10. **ID Poisoning Attack**: Attempt to use a 2KB junk character string as `{userId}` -> DENIED by `isValidId(userId)`.
11. **Shadow Field Injection**: Attempt to write unexpected privileged fields outside the schema -> DENIED.
12. **Arbitrary Collection Access**: Attempt to read or write `/admin_data` or other unmapped paths -> DENIED by global default-deny.
