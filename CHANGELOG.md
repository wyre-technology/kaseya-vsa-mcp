# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Ignore unresolved MCPB/DXT config placeholders (`${user_config.X}`) in credentials. A blank optional Kaseya One token field caused Claude Desktop to inject the literal `${user_config.kaseya_vsa_k1_token}` string, which was preferred over valid local username/password and made every request authenticate with a bogus SSO token (401). Empty, whitespace-only, and placeholder credential values are now normalised to "absent" at ingress for both env and gateway-header sources (mirrors itglue-mcp #73).

### Added
- Initial scaffold of the Kaseya VSA MCP server.
- Stdio + HTTP (StreamableHTTP) transports.
- Gateway-mode credential handling via `X-Kaseya-VSA-Tenant-Url`, `X-Kaseya-VSA-Username`, `X-Kaseya-VSA-Password`, and `X-Kaseya-VSA-K1-Token` headers.
- 12 tools covering endpoints, software/hardware inventory, patches, agent procedures, alarms, tickets, organizations, and machine groups.
- Destructive actions (`kaseya_vsa_deploy_patches_now`, `kaseya_vsa_run_procedure`) gated behind elicitation confirmations.
- Multi-stage `Dockerfile` with GitHub Packages auth via build secret.
- Semantic-release based CI release pipeline (`.github/workflows/release.yml`).
- MCPB packaging script and Smithery registry config.
