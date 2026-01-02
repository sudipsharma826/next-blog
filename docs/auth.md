# Auth Module Changelog & Implementation Summary

## Recent Changes (2026-01-02)

### Features & Improvements
- Implemented `/auth/refresh` route for secure token regeneration using refresh token.
- Added logic to decode refresh token, validate session ID (sid), global token version (gtv), and user ID.
- Compared Redis GTV and session data for security; unauthorized if mismatched.
- Compared hashed refresh token in DB with provided token to prevent token reuse.
- On valid checks, generated new access and refresh tokens, updated session, and returned tokens to client.
- Updated controller error handling: all errors now include type and message for frontend clarity.
- Removed all try/catch from service layer; errors propagate to controller for consistent handling.
- Standardized UTC time usage for all backend timestamps and session expiry.
- Improved cookie handling for login, refresh, and logout routes.
- Ensured all controller endpoints using `@Res()` or `@Res({ passthrough: true })` always send a response.

### Best Practices Applied
- Service layer only throws exceptions; controller handles all error responses.
- Used `@Res({ passthrough: true })` for hybrid cookie setting and auto-response.
- All tokens and session logic use UTC for consistency.
- No token reuse: new refresh token generated on every refresh.
- Provider array in user model only updated if provider is not already present.

### Test Cases Covered
- Login (OAuth & Credentials): new/existing users, verified/unverified emails, invalid credentials.
- Email verification: valid/invalid/expired tokens, already verified.
- Forgot password: valid/invalid/expired OTP, non-existent email.
- Reset password: token validation, session invalidation, GTV increment.
- Logout: single session and all sessions, cookie clearing.
- Token validation: GTV mismatch, session/user not found, token reuse detection.

### Documentation Improvements
- Auth flow, routes, and test cases documented in `auth.md`.
- All recent changes and implementation details summarized here for future reference.

---

## Auth Route Workflows (Detailed Steps)

### /auth/login
1. Receive login request with credentials or OAuth payload.
2. Check if user exists in DB.
3. If user does not exist:
   - For OAuth: create user, set emailVerified based on provider, add provider to array.
   - For credentials: create user, set emailVerified to false, hash password, add provider.
4. If user exists but email not verified:
   - Generate verification token, store hash in Redis, send verification email.
   - Return message: verification required.
5. If user exists and email verified:
   - Update provider array if new provider.
   - Update name/image if missing and provided by OAuth.
   - Create session in DB, generate access/refresh tokens.
   - Hash refresh token, store in session.
   - Set cookies for tokens.
   - Return user info and tokens.

### /auth/google, /auth/github
1. Redirect user to provider for OAuth login.
2. On callback, receive user info from provider.
3. Pass user info to login flow (see above).
4. Set cookies, return user info and tokens.

### /auth/forgotpassword
1. Receive email from user.
2. Check if user exists in DB.
3. If not, return error: user not found.
4. If exists:
   - Check Redis for existing OTP (rate limit).
   - Generate 6-digit OTP, hash and store in Redis (5 min expiry).
   - Send OTP email to user.
   - Return message: OTP sent.

### /auth/verifyotp
1. Receive email and OTP from user.
2. Retrieve OTP hash from Redis.
3. Compare provided OTP with hash.
4. If invalid/expired, return error.
5. If valid:
   - Generate reset password token (JWT, 5 min expiry).
   - Hash and store token in Redis.
   - Remove OTP from Redis.
   - Set reset token cookie.
   - Return message: OTP verified, reset token issued.

### /auth/resetpassword
1. Receive new password and reset token (from cookie).
2. Decode and validate reset token (expiry, payload).
3. Retrieve token hash from Redis, compare with provided token.
4. If invalid/expired, return error.
5. If valid:
   - Hash new password.
   - Update user password in DB, increment GTV.
   - Update GTV in Redis.
   - Delete all user sessions in DB.
   - Remove reset token from Redis.
   - Return message: password reset successful.

### /auth/logout
1. Receive refresh token (from cookie).
2. Decode token, extract sid and gtv.
3. Validate session exists in DB.
4. Check GTV in Redis matches token gtv.
5. If mismatch, return error.
6. If valid:
   - Delete session from DB.
   - Clear access and refresh token cookies.
   - Return message: logged out successfully.

### /auth/logoutall
1. Receive refresh token (from cookie).
2. Decode token, extract userId and gtv.
3. Check GTV in Redis matches token gtv.
4. If mismatch, return error.
5. If valid:
   - Increment GTV in DB and Redis.
   - Delete all sessions for user in DB.
   - Clear access and refresh token cookies.
   - Return message: logged out from all devices.

### /auth/refresh
1. Receive refresh token (from cookie).
2. Decode token, extract sid, gtv, userId.
3. Check GTV in Redis matches token gtv.
4. Validate session exists in DB and belongs to user.
5. Compare provided refresh token with hashed token in session.
6. If mismatch, return error: token reuse detected.
7. If valid:
   - Generate new access and refresh tokens.
   - Hash and update refresh token in session.
   - Update session last used time.
   - Set cookies for new tokens.
   - Return user info and tokens.

---
