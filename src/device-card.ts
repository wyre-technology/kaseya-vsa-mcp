/**
 * Device-card payload builder for the MCP Apps (SEP-1865) UI surface.
 *
 * kaseya_vsa_get_agent results get a normalized `_card` object attached (see
 * index.ts) that the ui:// device card renders from. The card is progressive
 * enhancement: normalization is best-effort, and a null return simply means
 * the host renders no card while the JSON payload is unchanged.
 */

import type { VsaAgent } from "@wyre-technology/node-kaseya-vsa";

export const DEVICE_CARD_RESOURCE_URI = "ui://kaseya-vsa/device-card.html";

/** MCP Apps resource MIME (RESOURCE_MIME_TYPE in @modelcontextprotocol/ext-apps). */
export const MCP_APP_RESOURCE_MIME = "text/html;profile=mcp-app";

/**
 * Tool `_meta` advertising the card. Carries both the canonical flat key
 * (RESOURCE_URI_META_KEY in ext-apps) and the nested form ext-apps'
 * registerAppTool emits, so any MCP Apps host revision finds it.
 */
export const DEVICE_CARD_META = {
  "ui/resourceUri": DEVICE_CARD_RESOURCE_URI,
  ui: { resourceUri: DEVICE_CARD_RESOURCE_URI },
} as const;

/** Mirror of DeviceCard in ui/device-card.ts — keep in sync. */
export interface DeviceCard {
  agentId: string;
  /** Display name — AgentName, falling back to ComputerName. */
  name: string;
  /** Hostname, when distinct from the display name. */
  computerName?: string;
  /** "Online" / "Offline" resolved from the agent's Online flag. */
  status?: string;
  operatingSystem?: string;
  ipAddress?: string;
  organization?: string;
  machineGroup?: string;
  /** ISO timestamp of the agent's last check-in. */
  lastCheckin?: string;
}

/** Brand overrides injected into the card as `window.__BRAND__`. */
export interface CardBrand {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  bg?: string;
  text?: string;
}

/** The comment marker in ui/index.html that serve-time injection replaces. */
const BRAND_INJECT_MARKER = /<!-- BRAND_INJECT:[\s\S]*?-->/;

/**
 * Replace the card's BRAND_INJECT comment with a `window.__BRAND__` script.
 * The card ships neutral; this is the customization mechanism. An empty
 * brand returns the HTML unchanged. `<` is escaped so brand values can
 * never break out of the injected script tag.
 */
export function applyBrandInjection(html: string, brand: CardBrand): string {
  const entries = Object.entries(brand).filter(
    ([, value]) => typeof value === "string" && value !== ""
  );
  if (entries.length === 0) return html;
  const json = JSON.stringify(Object.fromEntries(entries)).replace(/</g, "\\u003c");
  return html.replace(BRAND_INJECT_MARKER, `<script>window.__BRAND__=${json}</script>`);
}

/**
 * Resolve brand overrides from MCP_BRAND_* environment variables. Returns
 * an empty brand (HTML served unchanged) when none are set, or on runtimes
 * without `process.env`.
 */
export function brandFromEnv(): CardBrand {
  if (typeof process === "undefined" || !process.env) return {};
  const env = process.env;
  const brand: CardBrand = {};
  if (env.MCP_BRAND_NAME) brand.name = env.MCP_BRAND_NAME;
  if (env.MCP_BRAND_LOGO_URL) brand.logoUrl = env.MCP_BRAND_LOGO_URL;
  if (env.MCP_BRAND_PRIMARY_COLOR) brand.primaryColor = env.MCP_BRAND_PRIMARY_COLOR;
  if (env.MCP_BRAND_ACCENT_COLOR) brand.accentColor = env.MCP_BRAND_ACCENT_COLOR;
  if (env.MCP_BRAND_BG) brand.bg = env.MCP_BRAND_BG;
  if (env.MCP_BRAND_TEXT) brand.text = env.MCP_BRAND_TEXT;
  return brand;
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/**
 * Normalize a VSA agent into the flat, label-resolved payload the ui://
 * device card renders from. VSA agent records already carry resolved
 * organization / machine-group names, so no extra lookups are needed —
 * the card is read-only and renders entirely from this payload.
 */
export function buildDeviceCard(
  agent: Partial<VsaAgent> | null | undefined
): DeviceCard | null {
  if (!agent) return null;
  const agentId = agent.AgentId;
  if (agentId == null || (typeof agentId !== "string" && typeof agentId !== "number")) {
    return null;
  }
  const id = String(agentId);
  if (id === "") return null;

  const agentName = nonEmpty(agent.AgentName);
  const computerName = nonEmpty(agent.ComputerName);

  const card: DeviceCard = {
    agentId: id,
    name: agentName ?? computerName ?? `Agent ${id}`,
  };

  if (computerName && computerName !== card.name) card.computerName = computerName;
  if (typeof agent.Online === "boolean") {
    card.status = agent.Online ? "Online" : "Offline";
  }

  const os = nonEmpty(agent.OperatingSystem);
  const osVersion = nonEmpty(agent.OSVersion);
  if (os) card.operatingSystem = osVersion ? `${os} ${osVersion}` : os;

  const ipAddress = nonEmpty(agent.IPAddress);
  if (ipAddress) card.ipAddress = ipAddress;
  const organization = nonEmpty(agent.Organization);
  if (organization) card.organization = organization;
  const machineGroup = nonEmpty(agent.MachineGroup);
  if (machineGroup) card.machineGroup = machineGroup;

  const lastCheckin = nonEmpty(agent.LastCheckin);
  if (lastCheckin && !Number.isNaN(new Date(lastCheckin).getTime())) {
    card.lastCheckin = lastCheckin;
  }

  return card;
}
