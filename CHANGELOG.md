# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial scaffold of the Kaseya VSA MCP server.
- Stdio + HTTP (StreamableHTTP) transports.
- Gateway-mode credential handling via `X-Kaseya-VSA-Tenant-Url`, `X-Kaseya-VSA-Username`, `X-Kaseya-VSA-Password`, and `X-Kaseya-VSA-K1-Token` headers.
- 12 tools covering endpoints, software/hardware inventory, patches, agent procedures, alarms, tickets, organizations, and machine groups.
- Destructive actions (`kaseya_vsa_deploy_patches_now`, `kaseya_vsa_run_procedure`) gated behind elicitation confirmations.
- Multi-stage `Dockerfile` with GitHub Packages auth via build secret.
- Semantic-release based CI release pipeline (`.github/workflows/release.yml`).
- MCPB packaging script and Smithery registry config.
