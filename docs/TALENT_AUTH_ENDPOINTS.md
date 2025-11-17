# Talent Authentication Endpoints

Base path: `/auth`

Important:
- Login requires the user’s email to be verified.
- JWT bearer token is required for protected endpoints.

## Register Talent
- Method: `POST`
- URL: `/auth/register/talent`
- Alias: `/auth/talent/signup`
- Controller: `src/auth/auth.controller.ts:27,42`
- Service: `src/auth/auth.service.ts:34`
- Request body (RegisterDto):
  - `email` string
  - `password` string (min 6)
  - `firstName` string
  - `lastName` string (optional)
  - `confirmPassword` string (min 6)
- Example:
```
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "confirmPassword": "password123"
}
```
- Success: `201 Created`
- Errors: `400 Bad Request`, `409 Conflict`

## Talent Login
- Method: `POST`
- URL: `/auth/talent/login`
- Controller: `src/auth/auth.controller.ts:79`
- Service: `src/auth/auth.service.ts:185`
- Request body (LoginDto):
  - `email` string
  - `password` string (min 6)
- Example:
```
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Success: `200 OK`
- Response (AuthResponseDto):
```
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "verified_talent"
  }
}
```
- Errors: `401 Unauthorized`, `403 Forbidden` (inactive or email not verified)

## Forgot Password (Talent)
- Method: `POST`
- URL: `/auth/talent/forgot-password`
- Controller: `src/auth/auth.controller.ts:88`
- Service: `src/auth/auth.service.ts:366`
- Request body:
  - `email` string
- Example:
```
{
  "email": "user@example.com"
}
```
- Success: `200 OK`
- Response:
```
{
  "url": "https://frontend.example.com/auth/resetPassword?token=<jwt>"
}
```

## Logout
- Method: `POST`
- URL: `/auth/logout`
- Auth: `Bearer <accessToken>`
- Controller: `src/auth/auth.controller.ts:96`
- Service: `src/auth/auth.service.ts:258`
- Success: `200 OK`

## Me (Profile)
- Method: `GET`
- URL: `/auth/me`
- Auth: `Bearer <accessToken>`
- Controller: `src/auth/auth.controller.ts:106`
- Success: `200 OK`
- Response: current user payload from request context

## Send Verification Email
- Method: `POST`
- URL: `/auth/send-verification-email`
- Controller: `src/auth/auth.controller.ts:115`
- Service: `src/auth/auth.service.ts:265`
- Request body:
  - `email` string
- Success: `200 OK`
- Side-effects: emits `email.verification` event and sends a link to `FRONTEND_URL/auth/verify-email?token=<jwt>`

## Verify Email
- Method: `GET`
- URL: `/auth/verify-email?token=<jwt>`
- Controller: `src/auth/auth.controller.ts:126`
- Service: `src/auth/auth.service.ts:289`
- Success: `200 OK` (marks user emailVerified=true, status ACTIVE)
- Errors: `401 Invalid or expired token`, `409 Email already verified`

## Notes
- Refresh token flow exists in the service (`src/auth/auth.service.ts:234`) but is not exposed as a controller endpoint.
- Swagger UI: `http://localhost:<PORT>/docs` (JSON at `/docs-json`).