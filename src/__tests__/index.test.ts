/**
 * Tests for index.ts exports and factory functions
 */

import { 
  GdeltClient, 
  EnhancedGdeltClient, 
  createEnhancedGdeltClient,
  EFormat,
  EMode
} from '../index';

describe('Index exports', () => {
  it('should export all main classes and types', () => {
    expect(GdeltClient).toBeDefined();
    expect(EnhancedGdeltClient).toBeDefined();
    expect(createEnhancedGdeltClient).toBeDefined();
    expect(EFormat).toBeDefined();
    expect(EMode).toBeDefined();
  });

  it('should export lookup types', () => {
    // Test that type exports work at runtime (these are just type checks)
    expect(typeof EFormat.json).toBe('string');
    expect(typeof EMode.articleList).toBe('string');
  });

  it('should create client with factory function', () => {
    const client = createEnhancedGdeltClient();
    expect(client).toBeInstanceOf(GdeltClient);
  });

  it('should create client with factory function and config', () => {
    const config = {
      timeout: 5000,
      retry: false,
      defaultFormat: EFormat.json
    };
    const client = createEnhancedGdeltClient(config);
    expect(client).toBeInstanceOf(GdeltClient);
  });

  it('should have EnhancedGdeltClient as alias for GdeltClient', () => {
    expect(EnhancedGdeltClient).toBe(GdeltClient);
  });

  it('should export factory function with proper typing', () => {
    expect(typeof createEnhancedGdeltClient).toBe('function');
    expect(createEnhancedGdeltClient.length).toBe(1); // Should accept 1 parameter
  });
});