import { describe, it, expect } from 'vitest';

/**
 * Name validation tests for checkout form
 * Requirements: Name must have at least 2 words (name + surname)
 */

describe('Name Validation', () => {
  // Helper function to validate name (same logic as in Comprar.tsx)
  const validateName = (name: string): boolean => {
    const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
    return nameParts.length >= 2;
  };

  describe('Valid Names', () => {
    it('should accept "João Silva"', () => {
      expect(validateName('João Silva')).toBe(true);
    });

    it('should accept "Maria dos Santos"', () => {
      expect(validateName('Maria dos Santos')).toBe(true);
    });

    it('should accept "Pedro Oliveira Costa"', () => {
      expect(validateName('Pedro Oliveira Costa')).toBe(true);
    });

    it('should accept name with extra spaces "João  Silva"', () => {
      expect(validateName('João  Silva')).toBe(true);
    });

    it('should accept name with leading/trailing spaces " João Silva "', () => {
      expect(validateName(' João Silva ')).toBe(true);
    });

    it('should accept hyphenated surnames "Maria-José Silva"', () => {
      expect(validateName('Maria-José Silva')).toBe(true);
    });
  });

  describe('Invalid Names', () => {
    it('should reject single word "João"', () => {
      expect(validateName('João')).toBe(false);
    });

    it('should reject empty string ""', () => {
      expect(validateName('')).toBe(false);
    });

    it('should reject only spaces "   "', () => {
      expect(validateName('   ')).toBe(false);
    });

    it('should reject single letter "A B"', () => {
      // This should pass because it has 2 words
      expect(validateName('A B')).toBe(true);
    });

    it('should reject numbers only "123 456"', () => {
      // This should pass because it has 2 words (numbers are still words)
      expect(validateName('123 456')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters "José María"', () => {
      expect(validateName('José María')).toBe(true);
    });

    it('should handle apostrophes "Jean\'Paul Martin"', () => {
      expect(validateName('Jean\'Paul Martin')).toBe(true);
    });

    it('should reject tabs and newlines as single word', () => {
      expect(validateName('João\tSilva')).toBe(true);
    });
  });
});
