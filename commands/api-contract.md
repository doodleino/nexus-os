---
description: Validate OpenAPI and Protobuf API contracts, detect breaking changes, and generate tests.
agent: architect
subtask: true
---

# API Contract Validation Command

Validate API schemas (OpenAPI 3.x, AsyncAPI, Protocol Buffers v3), detect breaking changes across service interfaces, ensure semantic versioning compliance, and generate contract verification tests.

## Usage

`/api-contract [spec-file] [--compare-with git-ref-or-file] [--type openapi|protobuf|graphql] [--generate-tests]`

- `spec-file` (optional): Path to schema definition (`openapi.yaml`, `service.proto`, `schema.graphql`). Defaults to auto-detecting schemas in `schemas/` or `api/`.
- `--compare-with`: Git reference (e.g., `origin/main`) or previous schema file to check for breaking changes.
- `--type`: Schema dialect (`openapi`, `protobuf`, `graphql`).
- `--generate-tests`: Automatically generate mock client/server contract tests asserting request/response validation.

## When to Use

- Before merging pull requests modifying API endpoints, request payloads, or status codes.
- When evolving microservice communication protocols (gRPC/HTTP) across independent teams.
- When ensuring API changes follow backwards compatibility (field deprecation before removal).
- Guided by microservice schema practices in `skills/grpc-protobuf-microservices/`.

## Execution Workflow

1. **Schema Syntax & Linting**:
   - Parse schema definitions against official specifications (Spectral for OpenAPI, `buf lint` for Protobuf).
   - Validate description completeness, response examples, and type correctness.

2. **Breaking Change Detection**:
   - Compare candidate schema with baseline version:
     - **Breaking**: Removing fields, altering field types, adding required request parameters, removing enum variants.
     - **Non-breaking**: Adding optional fields, adding new endpoints, adding response attributes.

3. **Security & Protocol Hygiene**:
   - Verify all endpoints enforce authentication schemes (Bearer JWT, OAuth2 scopes, mTLS).
   - Confirm rate limiting headers, CORS policies, and request payload size limits are defined.

4. **Contract Test Generation**:
   - Emit executable contract tests (e.g., Jest, Supertest, or Pytest) asserting that implementation payloads match schema definitions strictly without undeclared fields.

## Review Checklist

- [ ] Schema passes strict specification linting without syntax errors.
- [ ] Diff compared against baseline ref with zero unannounced breaking changes.
- [ ] Deprecation annotations (`@deprecated`, `deprecated: true`) attached to phased-out fields.
- [ ] Auth headers and error response schemas (400, 401, 403, 500) fully specified.
- [ ] Client SDK compatibility verified across consumers.

## Output Contract

Return a structured markdown report:
- **Specification Status**: Schema validity, endpoint count, models defined.
- **Breaking Change Analysis**: Categorized list of Breaking, Potentially Breaking, and Non-Breaking changes.
- **Recommendations**: Suggested schema version bump (MAJOR for breaking, MINOR for backwards-compatible).
- **Handoff**: Delegated to `architect` for interface sign-off.
