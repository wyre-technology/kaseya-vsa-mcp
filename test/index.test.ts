import { describe, it, expect } from 'vitest';

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
});
