# API Security

## Purpose

Hardens the API's transport layer with standard security headers on every response and per-IP rate limiting that returns a structured error when a client exceeds the allowed request volume.

## Requirements

### Requirement: Security headers on all responses

The API SHALL send standard security headers (for example `X-Content-Type-Options`, `X-Frame-Options`, and related Helmet defaults) on every HTTP response.

#### Scenario: A normal API response carries security headers

- **WHEN** a client calls an API endpoint
- **THEN** the response includes the standard security headers

### Requirement: Per-IP rate limiting

The API SHALL limit the number of requests a client IP can make within a time window. When the limit is exceeded, the API SHALL reject the request with HTTP `429` and a structured error body (`{ code, message }`), and SHALL NOT process the request.

#### Scenario: Request volume is within the limit

- **WHEN** a client makes requests at a rate within the configured limit
- **THEN** the requests are processed normally

#### Scenario: Request volume exceeds the limit

- **WHEN** a client exceeds the configured request limit within the time window
- **THEN** the API responds with HTTP `429`
- **AND** the response body is a structured `{ code, message }` error
