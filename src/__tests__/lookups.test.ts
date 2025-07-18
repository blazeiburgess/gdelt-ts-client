/**
 * Tests for GDELT Lookup Types and Utilities
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CountryCode,
  LanguageCode,
  GKGTheme,
  ImageTag,
  ImageWebTag,
  CountryLookup,
  LanguageLookup,
  ThemeDescriptions,
  isValidCountry,
  isValidLanguage,
  isValidTheme,
  isValidImageTag,
  isValidImageWebTag,
  searchCountries,
  searchLanguages,
  searchThemes,
  getCountryName,
  getCountryCode,
  getLanguageName,
  getLanguageCode,
  getThemeDescription,
  getThemesByCategory,
  getPopularTags,
  searchImageTags,
  searchImageWebTags
} from '../types/lookups';

describe('GDELT Lookup Types', () => {
  describe('Country Lookups', () => {
    it('should validate known country codes', () => {
      expect(isValidCountry('US')).toBe(true);
      expect(isValidCountry('FR')).toBe(true);
      expect(isValidCountry('BR')).toBe(true);
      expect(isValidCountry('IN')).toBe(true);
      expect(isValidCountry('GB')).toBe(true);
    });

    it('should validate known country names', () => {
      expect(isValidCountry('unitedstates')).toBe(true);
      expect(isValidCountry('france')).toBe(true);
      expect(isValidCountry('japan')).toBe(true);
      expect(isValidCountry('brazil')).toBe(true);
      expect(isValidCountry('india')).toBe(true);
    });

    it('should reject invalid country codes', () => {
      expect(isValidCountry('XX')).toBe(false);
      expect(isValidCountry('ZZ')).toBe(false);
      expect(isValidCountry('USA')).toBe(false); // 3-letter code
      expect(isValidCountry('invalidcountry')).toBe(false);
      expect(isValidCountry('')).toBe(false);
    });

    it('should search countries by partial name', () => {
      const results = searchCountries('united');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'United States')).toBe(true);
      expect(results.some(r => r.name === 'United Kingdom')).toBe(true);
    });

    it('should search countries by partial code', () => {
      const results = searchCountries('US');
      expect(results.length).toBeGreaterThan(0);
      // US should be found either as code or in name
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid search', () => {
      const results = searchCountries('invalidcountryname');
      expect(results).toEqual([]);
    });

    it('should get country name by code', () => {
      const countryName = getCountryName('US');
      expect(countryName).toBeDefined();
      expect(countryName).toBe('United States');
    });

    it('should get country code by name', () => {
      const countryCode = getCountryCode('United States');
      expect(countryCode).toBeDefined();
      expect(countryCode).toBe('US');
    });

    it('should return undefined for invalid country name', () => {
      const countryCode = getCountryCode('InvalidCountry');
      expect(countryCode).toBeUndefined();
    });
  });

  describe('Language Lookups', () => {
    it('should validate known language codes', () => {
      expect(isValidLanguage('eng')).toBe(true);
      expect(isValidLanguage('spa')).toBe(true);
      expect(isValidLanguage('fra')).toBe(true);
      expect(isValidLanguage('deu')).toBe(true);
      expect(isValidLanguage('jpn')).toBe(true);
    });

    it('should validate known language names', () => {
      expect(isValidLanguage('english')).toBe(true);
      expect(isValidLanguage('spanish')).toBe(true);
      expect(isValidLanguage('french')).toBe(true);
      expect(isValidLanguage('german')).toBe(true);
      expect(isValidLanguage('japanese')).toBe(true);
    });

    it('should reject invalid language codes', () => {
      expect(isValidLanguage('xxx')).toBe(false);
      expect(isValidLanguage('invalidlang')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage('en')).toBe(false); // 2-letter code
    });

    it('should search languages by partial name', () => {
      const results = searchLanguages('en');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'English')).toBe(true);
    });

    it('should search languages by partial code', () => {
      const results = searchLanguages('eng');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.code === 'eng')).toBe(true);
    });

    it('should return empty array for invalid search', () => {
      const results = searchLanguages('invalidlanguage');
      expect(results).toEqual([]);
    });

    it('should get language name by code', () => {
      const languageName = getLanguageName('eng');
      expect(languageName).toBeDefined();
      expect(languageName).toBe('English');
    });

    it('should get language code by name', () => {
      const languageCode = getLanguageCode('English');
      expect(languageCode).toBeDefined();
      expect(languageCode).toBe('eng');
    });

    it('should return undefined for invalid language name', () => {
      const languageCode = getLanguageCode('InvalidLanguage');
      expect(languageCode).toBeUndefined();
    });
  });

  describe('Theme Lookups', () => {
    it('should validate known themes', () => {
      expect(isValidTheme('TAX_FNCACT')).toBe(true);
      expect(isValidTheme('TAX_ETHNICITY')).toBe(true);
      expect(isValidTheme('ECON_STOCKMARKET')).toBe(true);
      // Use themes we know exist in the lookup
      expect(isValidTheme('NATURAL_DISASTER')).toBe(true);
    });

    it('should reject invalid themes', () => {
      expect(isValidTheme('INVALID_THEME')).toBe(false);
      expect(isValidTheme('tax_fncact')).toBe(true); // case insensitive
      expect(isValidTheme('')).toBe(false);
      expect(isValidTheme('RANDOM_STRING')).toBe(false);
    });

    it('should search themes by partial name', () => {
      const results = searchThemes('tax');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.includes('TAX_'))).toBe(true);
    });

    it('should search themes by description', () => {
      const results = searchThemes('economic');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.includes('ECON_'))).toBe(true);
    });

    it('should return empty array for invalid search', () => {
      const results = searchThemes('invalidthemename');
      expect(results).toEqual([]);
    });

    it('should get theme description', () => {
      const description = getThemeDescription('TAX_FNCACT');
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('should return theme name for invalid theme', () => {
      const description = getThemeDescription('INVALID_THEME' as GKGTheme);
      expect(description).toBe('INVALID_THEME'); // Returns the theme name if no description found
    });

    it('should get themes by category', () => {
      const economicThemes = getThemesByCategory('economic');
      expect(economicThemes).toBeDefined();
      expect(economicThemes.length).toBeGreaterThan(0);
      expect(economicThemes.some(theme => theme.includes('ECON_'))).toBe(true);
    });

    it('should get themes by category with case insensitive search', () => {
      const crisisThemes = getThemesByCategory('CRISIS');
      expect(crisisThemes).toBeDefined();
      expect(crisisThemes.length).toBeGreaterThan(0);
      expect(crisisThemes.some(theme => theme.includes('CRISIS'))).toBe(true);
    });

    it('should return empty array for invalid theme category', () => {
      const invalidThemes = getThemesByCategory('nonexistentcategory');
      expect(invalidThemes).toEqual([]);
    });
  });

  describe('Image Tag Lookups', () => {
    it('should validate known image tags', () => {
      expect(isValidImageTag('person')).toBe(true);
      expect(isValidImageTag('vehicle')).toBe(true);
      expect(isValidImageTag('building')).toBe(true);
      expect(isValidImageTag('animal')).toBe(true);
    });

    it('should reject invalid image tags', () => {
      expect(isValidImageTag('invalidtag')).toBe(false);
      expect(isValidImageTag('')).toBe(false);
      expect(isValidImageTag('PERSON')).toBe(true); // case insensitive
    });

    it('should get popular tags by category', () => {
      const people = getPopularTags('people');
      expect(people).toBeDefined();
      expect(people.length).toBeGreaterThan(0);
      expect(people.some(t => t === 'person')).toBe(true);

      const objects = getPopularTags('objects');
      expect(objects).toBeDefined();
      expect(objects.length).toBeGreaterThan(0);
      expect(objects.some(t => t === 'vehicle')).toBe(true);
    });

    it('should search image tags by keyword', () => {
      const results = searchImageTags('person');
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(tag => tag === 'person')).toBe(true);
    });

    it('should search image tags case insensitively', () => {
      const results = searchImageTags('VEHICLE');
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(tag => tag.toLowerCase().includes('vehicle'))).toBe(true);
    });

    it('should limit image tag search results', () => {
      const results = searchImageTags('a'); // Common letter
      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array for invalid image tag search', () => {
      const results = searchImageTags('nonexistenttagname');
      expect(results).toEqual([]);
    });
  });

  describe('Image Web Tag Lookups', () => {
    it('should validate known image web tags', () => {
      expect(isValidImageWebTag('News')).toBe(true);
      expect(isValidImageWebTag('Politics')).toBe(true);
      expect(isValidImageWebTag('Sports')).toBe(true);
      expect(isValidImageWebTag('Technology')).toBe(true);
    });

    it('should reject invalid image web tags', () => {
      expect(isValidImageWebTag('invalidwebtag')).toBe(false);
      expect(isValidImageWebTag('')).toBe(false);
      expect(isValidImageWebTag('news')).toBe(false); // case sensitive - expects proper case
    });

    it('should search image web tags by keyword', () => {
      const results = searchImageWebTags('news');
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(tag => tag === 'News')).toBe(true);
    });

    it('should search image web tags case insensitively', () => {
      const results = searchImageWebTags('POLITICS');
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(tag => tag.toLowerCase().includes('politics'))).toBe(true);
    });

    it('should limit image web tag search results', () => {
      const results = searchImageWebTags('a'); // Common letter
      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array for invalid image web tag search', () => {
      const results = searchImageWebTags('nonexistentwebtagname');
      expect(results).toEqual([]);
    });
  });
});

describe('Lookup Type Safety', () => {
  it('should enforce CountryCode type safety', () => {
    // These should compile without errors
    const validCodes: CountryCode[] = ['US', 'FR', 'BR', 'IN'];
    validCodes.forEach(code => {
      expect(isValidCountry(code)).toBe(true);
    });
  });

  it('should enforce LanguageCode type safety', () => {
    // These should compile without errors
    const validCodes: LanguageCode[] = ['eng', 'spa', 'fra', 'deu', 'jpn'];
    validCodes.forEach(code => {
      expect(isValidLanguage(code)).toBe(true);
    });
  });

  it('should enforce GKGTheme type safety', () => {
    // These should compile without errors
    const validThemes: GKGTheme[] = ['TAX_FNCACT', 'TAX_ETHNICITY', 'ECON_STOCKMARKET'];
    validThemes.forEach(theme => {
      expect(isValidTheme(theme)).toBe(true);
    });
  });

  it('should enforce ImageTag type safety', () => {
    // These should compile without errors
    const validTags: ImageTag[] = ['person', 'vehicle', 'building', 'animal'];
    validTags.forEach(tag => {
      expect(isValidImageTag(tag)).toBe(true);
    });
  });

  it('should enforce ImageWebTag type safety', () => {
    // These should compile without errors
    const validTags: ImageWebTag[] = ['News', 'Politics', 'Sports', 'Technology'];
    validTags.forEach(tag => {
      expect(isValidImageWebTag(tag)).toBe(true);
    });
  });
});

describe('Lookup Data Integrity', () => {
  it('should have consistent country data', () => {
    // Test that all country codes have descriptions
    const allCountries = Object.keys(CountryLookup);
    expect(allCountries.length).toBeGreaterThan(0);
    
    allCountries.forEach(code => {
      const description = CountryLookup[code as CountryCode];
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });
  });

  it('should have consistent language data', () => {
    // Test that all language codes have descriptions
    const allLanguages = Object.keys(LanguageLookup);
    expect(allLanguages.length).toBeGreaterThan(0);
    
    allLanguages.forEach(code => {
      const description = LanguageLookup[code as LanguageCode];
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });
  });

  it('should have consistent theme data', () => {
    // Test that all themes have descriptions
    const allThemes = Object.keys(ThemeDescriptions);
    expect(allThemes.length).toBeGreaterThan(0);
    
    allThemes.forEach(theme => {
      const description = ThemeDescriptions[theme];
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      if (description) {
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });

  it('should have normalized country names', () => {
    // Test that country names are properly normalized
    const countries = searchCountries('united states');
    expect(countries.length).toBeGreaterThan(0);
    
    const us = countries.find(c => c.code === 'US');
    expect(us).toBeDefined();
    expect(us?.name).toBe('United States');
  });

  it('should have normalized language names', () => {
    // Test that language names are properly normalized
    const languages = searchLanguages('english');
    expect(languages.length).toBeGreaterThan(0);
    
    const eng = languages.find(l => l.code === 'eng');
    expect(eng).toBeDefined();
    expect(eng?.name).toBe('English');
  });
});

describe('Lookup Search Performance', () => {
  it('should handle large search results efficiently', () => {
    const start = performance.now();
    const results = searchCountries('a'); // Common letter
    const end = performance.now();
    
    expect(results.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(50); // Should complete in under 50ms
  });

  it('should handle empty search results efficiently', () => {
    const start = performance.now();
    const results = searchCountries('zzzzzzzzzzz'); // No matches
    const end = performance.now();
    
    expect(results).toEqual([]);
    expect(end - start).toBeLessThan(10); // Should complete in under 10ms
  });

  it('should handle theme search efficiently', () => {
    const start = performance.now();
    const results = searchThemes('tax');
    const end = performance.now();
    
    expect(results.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(50); // Should complete in under 50ms
  });
});

describe('Lookup Error Handling', () => {
  it('should handle null/undefined inputs gracefully', () => {
    expect(() => isValidCountry(null as any)).toThrow();
    expect(() => isValidCountry(undefined as any)).toThrow();
    expect(() => isValidLanguage(null as any)).toThrow();
    expect(() => isValidLanguage(undefined as any)).toThrow();
    expect(() => isValidTheme(null as any)).toThrow();
    expect(() => isValidTheme(undefined as any)).toThrow();
  });

  it('should handle empty string inputs gracefully', () => {
    expect(isValidCountry('')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
    expect(isValidTheme('')).toBe(false);
    expect(isValidImageTag('')).toBe(false);
    expect(isValidImageWebTag('')).toBe(false);
  });

  it('should handle invalid search inputs gracefully', () => {
    expect(() => searchCountries(null as any)).toThrow();
    expect(() => searchCountries(undefined as any)).toThrow();
    expect(() => searchLanguages(null as any)).toThrow();
    expect(() => searchLanguages(undefined as any)).toThrow();
    expect(() => searchThemes(null as any)).toThrow();
    expect(() => searchThemes(undefined as any)).toThrow();
  });

  it('should handle case insensitive searches', () => {
    const upperResults = searchCountries('UNITED');
    const lowerResults = searchCountries('united');
    const mixedResults = searchCountries('United');
    
    expect(upperResults.length).toBeGreaterThan(0);
    expect(lowerResults.length).toBeGreaterThan(0);
    expect(mixedResults.length).toBeGreaterThan(0);
    
    // Should return same results regardless of case
    expect(upperResults).toEqual(lowerResults);
    expect(lowerResults).toEqual(mixedResults);
  });
});