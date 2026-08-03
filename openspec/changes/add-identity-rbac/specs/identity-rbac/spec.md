# Identity and RBAC Specification

## ADDED Requirements

### Requirement: Public customer registration

The system SHALL allow a visitor to register a customer account with valid credentials.

#### Scenario: Successful registration creates a customer

- **GIVEN** a visitor submits valid registration credentials
- **WHEN** the registration request is processed
- **THEN** the stored user role is `customer`
- **AND** the response does not expose credential secrets

#### Scenario: Registration cannot create admin

- **GIVEN** a visitor submits registration data containing `role`, `isAdmin`, or equivalent authorization fields
- **WHEN** the registration request is processed
- **THEN** the system ignores or rejects those fields
- **AND** the stored user role remains `customer`

### Requirement: Login issues authenticated access

The system SHALL authenticate registered users and issue a token that identifies the user and role.

#### Scenario: Valid credentials

- **GIVEN** a registered user submits valid credentials
- **WHEN** login succeeds
- **THEN** the response includes an access token
- **AND** the token represents the user id and role

#### Scenario: Invalid credentials

- **GIVEN** a login request has an unknown email or wrong password
- **WHEN** login fails
- **THEN** the response uses the shared error envelope
- **AND** no credential-specific detail is leaked

### Requirement: Authenticated profile

The system SHALL expose the current user's identity to authenticated clients.

#### Scenario: User requests profile

- **GIVEN** a request includes a valid token
- **WHEN** the profile endpoint is called
- **THEN** the response includes the user's id, email, and role
- **AND** it excludes password hashes and secrets

### Requirement: Role-protected administrator access

The system SHALL restrict administrator-only operations to authenticated users with role `admin`.

#### Scenario: Customer is forbidden

- **GIVEN** a request includes a valid customer token
- **WHEN** the user calls an administrator-only endpoint
- **THEN** the response is forbidden
- **AND** the error uses a stable authorization code

#### Scenario: Admin is allowed

- **GIVEN** a request includes a valid admin token
- **WHEN** the user calls an administrator-only endpoint
- **THEN** the request passes authorization

### Requirement: Environment-controlled development admin seed

The system SHALL create the initial development admin only from explicit environment configuration.

#### Scenario: Seed configuration exists

- **GIVEN** development admin seed variables are configured
- **WHEN** the seed runs
- **THEN** an admin account exists with role `admin`

#### Scenario: Seed configuration is absent

- **GIVEN** development admin seed variables are absent
- **WHEN** the seed runs
- **THEN** no default admin account is created
