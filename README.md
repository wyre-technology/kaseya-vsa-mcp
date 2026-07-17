# Kaseya VSA MCP Server

[![Release](https://github.com/wyre-technology/kaseya-vsa-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/wyre-technology/kaseya-vsa-mcp/actions/workflows/release.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Model Context Protocol (MCP) server for the Kaseya VSA RMM API.
Exposes managed endpoints, software / hardware inventory, patch state, agent
procedures, alarms, Service Desk tickets, organizations, and machine groups
to AI assistants.

## Tools

| Tool | Description |
|------|-------------|
| `kaseya_vsa_list_agents` | List managed endpoints (agents). Optional `$filter`. |
| `kaseya_vsa_get_agent` | Get an agent's details by ID (renders as an interactive card in MCP Apps hosts). |
| `kaseya_vsa_get_software_inventory` | Installed software for an agent. |
| `kaseya_vsa_get_hardware_inventory` | Hardware audit for an agent. |
| `kaseya_vsa_get_patch_status` | Pending and installed patches for an agent. |
| `kaseya_vsa_deploy_patches_now` | Force a patch deploy on an agent (destructive — confirmation required). |
| `kaseya_vsa_list_procedures` | Agent procedures available to run. |
| `kaseya_vsa_run_procedure` | Execute a procedure on an agent (destructive — confirmation required). |
| `kaseya_vsa_list_alarms` | Open alarms (optional state filter; date-window elicitation if missing). |
| `kaseya_vsa_list_tickets` | Service Desk tickets (returns a friendly message if SD module isn't enabled). |
| `kaseya_vsa_list_organizations` | Tenant organizations. |
| `kaseya_vsa_list_machine_groups` | Machine group hierarchy. |

When the user omits required filters or runs a destructive action, the server
uses MCP elicitation to prompt for choices or confirm.

### Interactive device card (MCP Apps)

`kaseya_vsa_get_agent` renders as a read-only interactive device card in MCP
Apps hosts (Claude Desktop/web), showing the endpoint's name, online status,
organization, machine group, OS, IP address, and last check-in. The card is
neutral by default, brandable via `window.__BRAND__` injection or
`MCP_BRAND_*` env vars (`MCP_BRAND_NAME`, `MCP_BRAND_LOGO_URL`,
`MCP_BRAND_PRIMARY_COLOR`, `MCP_BRAND_ACCENT_COLOR`, `MCP_BRAND_BG`,
`MCP_BRAND_TEXT`) applied at serve time. Plain-JSON behavior is unchanged in
other hosts. After editing `ui/`, regenerate the embedded bundle with
`npm run build:ui`.

## Configuration

### Environment-variable mode (default)

| Variable | Required | Description |
|----------|----------|-------------|
| `KASEYA_VSA_TENANT_URL` | yes | Full base URL incl. `/api/v1.0` |
| `KASEYA_VSA_USERNAME` | one of | Local-auth username |
| `KASEYA_VSA_PASSWORD` | one of | Local-auth password (secret) |
| `KASEYA_VSA_K1_TOKEN` | one of | Kaseya One SSO token (alternative to username + password) |
| `MCP_TRANSPORT` | no | `stdio` (default) or `http` |
| `MCP_HTTP_PORT` | no | HTTP listen port (default `8080`) |
| `AUTH_MODE` | no | `env` (default) or `gateway` |

Either the username + password pair OR the `KASEYA_VSA_K1_TOKEN` is required.

### Gateway mode

When deployed behind the WYRE MCP Gateway, set `AUTH_MODE=gateway` and the
server will read credentials from per-request HTTP headers:

- `X-Kaseya-VSA-Tenant-Url` (required)
- `X-Kaseya-VSA-Username` (with password)
- `X-Kaseya-VSA-Password` (with username)
- `X-Kaseya-VSA-K1-Token` (alternative to username + password)

Each request creates a fresh server instance with isolated credentials — no
cross-tenant `process.env` pollution.

## Local development

```bash
npm install
npm run build
KASEYA_VSA_TENANT_URL=https://vsa.example.com/api/v1.0 \
  KASEYA_VSA_USERNAME=... \
  KASEYA_VSA_PASSWORD=... \
  npm start
```

Run as HTTP for testing:

```bash
MCP_TRANSPORT=http npm start
curl http://localhost:8080/health
```

## Docker

```bash
docker build -t kaseya-vsa-mcp .
docker run --rm -p 8080:8080 \
  -e KASEYA_VSA_TENANT_URL=https://vsa.example.com/api/v1.0 \
  -e KASEYA_VSA_USERNAME=... \
  -e KASEYA_VSA_PASSWORD=... \
  kaseya-vsa-mcp
```

## License

Apache-2.0
