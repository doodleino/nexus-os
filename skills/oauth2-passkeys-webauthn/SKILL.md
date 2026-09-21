---
name: oauth2-passkeys-webauthn
description: Passwordless authentication with WebAuthn and Passkeys, FIDO2 credentials, and hardened OAuth 2.1 authorization servers.
metadata:
  origin: NEXUS-OS
---

# OAuth 2.1 & Passkeys (WebAuthn)

Use this skill to implement phishing-resistant biometric authentication and modern OAuth 2.1 authorization with PKCE.

## Security Invariants

1. **Mandatory PKCE**: Never permit plain code exchanges; enforce Proof Key for Code Exchange (PKCE) for all clients.
2. **Challenge Verification**: Verify server-generated random cryptographic challenges on the backend to prevent replay attacks.
