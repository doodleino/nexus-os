---
name: zero-trust-api-security
description: Implement zero-trust API architecture, mutual TLS, OAuth2 JWT token verification, and fine-grained role-based access control.
---

# Zero-Trust API Security

This skill outlines patterns for securing distributed APIs, microservices, and internal endpoints under a Zero-Trust paradigm ("never trust, always verify").

## Core Principles

1. **Explicit Identity Verification**: Every request must carry cryptographically verifiable identity claims (OAuth2, OIDC, mTLS), regardless of whether it originates inside or outside the network boundary.
2. **Least Privilege Enforcement**: Scope access tokens to specific resources and actions (`read:users`, `write:billing`) rather than broad administrative roles.
3. **Mutual TLS (mTLS)**: Authenticate both client and server at the transport layer for all internal inter-service communications.

## Implementation Checklist

- Validate JWT signature, expiration (`exp`), issuer (`iss`), and audience (`aud`) on every single incoming request.
- Implement token revocation checks using an ephemeral distributed cache (Redis) or short-lived token lifetimes (<15 minutes).
- Enforce strict rate-limiting per API key / IP address at the reverse proxy or API gateway layer.
- Ensure all sensitive data fields are encrypted at rest using envelope encryption with rotating keys.
