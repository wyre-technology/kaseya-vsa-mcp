import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Importing from ../src pulls in the production credential helpers. The module
// guards its main() bootstrap on NODE_ENV=test (which vitest sets) so this
// import does not start an MCP server during tests.
import { cleanCredential, createClient, getCredentials } from '../src/index.js';

describe('Kaseya VSA MCP Server', () => {
  describe('Tool Definitions', () => {
    const expectedTools = [
      'kaseya_vsa_list_agents',
      'kaseya_vsa_get_agent',
      'kaseya_vsa_get_software_inventory',
      'kaseya_vsa_get_hardware_inventory',
      'kaseya_vsa_get_patch_status',
      'kaseya_vsa_deploy_patches_now',
      'kaseya_vsa_list_procedures',
      'kaseya_vsa_run_procedure',
      'kaseya_vsa_list_alarms',
      'kaseya_vsa_list_tickets',
      'kaseya_vsa_list_organizations',
      'kaseya_vsa_list_machine_groups',
    ];

    it('should define all 12 tools', () => {
      expect(expectedTools).toHaveLength(12);
    });

    it('should include agent / endpoint tools', () => {
      expect(expectedTools).toContain('kaseya_vsa_list_agents');
      expect(expectedTools).toContain('kaseya_vsa_get_agent');
    });

    it('should include inventory tools', () => {
      expect(expectedTools).toContain('kaseya_vsa_get_software_inventory');
      expect(expectedTools).toContain('kaseya_vsa_get_hardware_inventory');
    });

    it('should include patch tools', () => {
      expect(expectedTools).toContain('kaseya_vsa_get_patch_status');
      expect(expectedTools).toContain('kaseya_vsa_deploy_patches_now');
    });

    it('should include procedure tools', () => {
      expect(expectedTools).toContain('kaseya_vsa_list_procedures');
      expect(expectedTools).toContain('kaseya_vsa_run_procedure');
    });

    it('should include alarms, tickets, orgs, and machine groups', () => {
      expect(expectedTools).toContain('kaseya_vsa_list_alarms');
      expect(expectedTools).toContain('kaseya_vsa_list_tickets');
      expect(expectedTools).toContain('kaseya_vsa_list_organizations');
      expect(expectedTools).toContain('kaseya_vsa_list_machine_groups');
    });
  });

  describe('Credentials', () => {
    it('should require KASEYA_VSA_TENANT_URL plus either (USERNAME + PASSWORD) or K1_TOKEN', () => {
      const required = ['KASEYA_VSA_TENANT_URL'];
      const oneOf = ['KASEYA_VSA_USERNAME+KASEYA_VSA_PASSWORD', 'KASEYA_VSA_K1_TOKEN'];
      expect(required).toHaveLength(1);
      expect(oneOf).toHaveLength(2);
    });
  });

  describe('Server Configuration', () => {
    it('should define server with correct name', () => {
      const config = { name: 'kaseya-vsa-mcp', version: '0.0.0' };
      expect(config.name).toBe('kaseya-vsa-mcp');
    });
  });

  // Regression for issue #73 (mirrors itglue-mcp): MCPB/DXT desktop bundles map
  // env vars to "${user_config.X}" placeholders. When an OPTIONAL user_config
  // field is left blank, Claude Desktop injects the LITERAL "${user_config.X}"
  // string (truthy, non-empty). A blank Kaseya One token field therefore left the
  // literal "${user_config.kaseya_vsa_k1_token}" in KASEYA_VSA_K1_TOKEN; because a
  // truthy token is preferred over local user/pass in createClient, it overrode
  // valid local credentials and every request 401'd on the bogus SSO token.
  describe('issue #73: unresolved MCPB config placeholders', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('cleanCredential drops empty, whitespace, and ${...} placeholder values', () => {
      expect(cleanCredential(undefined)).toBeUndefined();
      expect(cleanCredential('')).toBeUndefined();
      expect(cleanCredential('   ')).toBeUndefined();
      expect(cleanCredential('${user_config.kaseya_vsa_k1_token}')).toBeUndefined();
      expect(cleanCredential('  ${user_config.kaseya_vsa_k1_token}  ')).toBeUndefined();
    });

    it('cleanCredential preserves and trims real credentials', () => {
      expect(cleanCredential('k1-real-sso-token')).toBe('k1-real-sso-token');
      expect(cleanCredential('  svc-account  ')).toBe('svc-account');
    });

    it('getCredentials ignores a placeholder K1 token but keeps local user/pass', () => {
      process.env.KASEYA_VSA_TENANT_URL = 'https://vsa.example.com/api/v1.0';
      process.env.KASEYA_VSA_USERNAME = 'svc-account';
      process.env.KASEYA_VSA_PASSWORD = 's3cret';
      process.env.KASEYA_VSA_K1_TOKEN = '${user_config.kaseya_vsa_k1_token}';

      const creds = getCredentials();

      expect(creds).not.toBeNull();
      expect(creds!.kaseyaOneToken).toBeUndefined();
      expect(creds!.username).toBe('svc-account');
      expect(creds!.password).toBe('s3cret');
    });

    it('createClient authenticates locally, not with the bogus SSO placeholder (the 401 repro)', () => {
      process.env.KASEYA_VSA_TENANT_URL = 'https://vsa.example.com/api/v1.0';
      process.env.KASEYA_VSA_USERNAME = 'svc-account';
      process.env.KASEYA_VSA_PASSWORD = 's3cret';
      process.env.KASEYA_VSA_K1_TOKEN = '${user_config.kaseya_vsa_k1_token}';

      const client = createClient(getCredentials()!);
      const config = client.getConfig();

      // Before the fix, createClient handed the placeholder to the client as the
      // Kaseya One SSO token and dropped the local credentials entirely.
      expect(config.kaseyaOneToken).toBeUndefined();
      expect(config.username).toBe('svc-account');
      expect(config.password).toBe('s3cret');
    });

    it('returns null when the only credential present is a placeholder', () => {
      process.env.KASEYA_VSA_TENANT_URL = 'https://vsa.example.com/api/v1.0';
      delete process.env.KASEYA_VSA_USERNAME;
      delete process.env.KASEYA_VSA_PASSWORD;
      process.env.KASEYA_VSA_K1_TOKEN = '${user_config.kaseya_vsa_k1_token}';

      expect(getCredentials()).toBeNull();
    });
  });
});
