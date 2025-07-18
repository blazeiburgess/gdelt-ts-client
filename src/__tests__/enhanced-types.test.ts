/**
 * Tests for Enhanced Types functionality
 */

import {
  Mode,
  Format,
  TimespanUnit,
  SortOrder,
  isValidTimespan,
  isValidDateTime,
  isValidMaxRecords,
  isValidTimelineSmooth,
  TimespanString,
  DateTimeString
} from '../types/enhanced-types';

describe('Enhanced Type Constants', () => {
  describe('Mode constants', () => {
    it('should provide all mode values', () => {
      expect(Mode.ARTICLE_LIST).toBe('artlist');
      expect(Mode.ARTICLE_GALLERY).toBe('artgallery');
      expect(Mode.IMAGE_COLLAGE).toBe('imagecollage');
      expect(Mode.IMAGE_COLLAGE_INFO).toBe('imagecollageinfo');
      expect(Mode.IMAGE_GALLERY).toBe('imagegallery');
      expect(Mode.IMAGE_COLLAGE_SHARE).toBe('imagecollagesshare');
      expect(Mode.TIMELINE_VOLUME).toBe('timelinevol');
      expect(Mode.TIMELINE_VOLUME_RAW).toBe('timelinevolraw');
      expect(Mode.TIMELINE_VOLUME_INFO).toBe('timelinevolinfo');
      expect(Mode.TIMELINE_TONE).toBe('timelinetone');
      expect(Mode.TIMELINE_LANGUAGE).toBe('timelinelang');
      expect(Mode.TIMELINE_SOURCE_COUNTRY).toBe('timelinesourcecountry');
      expect(Mode.TONE_CHART).toBe('tonechart');
      expect(Mode.WORD_CLOUD_IMAGE_TAGS).toBe('wordcloudimagetags');
      expect(Mode.WORD_CLOUD_IMAGE_WEB_TAGS).toBe('wordcloudimagewebtags');
    });

    it('should be immutable at TypeScript level', () => {
      // This test verifies the const assertion is working
      // Runtime immutability is not enforced, but TypeScript prevents mutations
      expect(typeof Mode).toBe('object');
      expect(Mode.ARTICLE_LIST).toBe('artlist');
    });
  });

  describe('Format constants', () => {
    it('should provide all format values', () => {
      expect(Format.HTML).toBe('html');
      expect(Format.CSV).toBe('csv');
      expect(Format.RSS).toBe('rss');
      expect(Format.RSS_ARCHIVE).toBe('rssarchive');
      expect(Format.JSON).toBe('json');
      expect(Format.JSONP).toBe('jsonp');
      expect(Format.JSON_FEED).toBe('jsonfeed');
    });

    it('should be immutable at TypeScript level', () => {
      expect(typeof Format).toBe('object');
      expect(Format.JSON).toBe('json');
    });
  });

  describe('TimespanUnit constants', () => {
    it('should provide all timespan unit values', () => {
      expect(TimespanUnit.MINUTES).toBe('min');
      expect(TimespanUnit.HOURS).toBe('h');
      expect(TimespanUnit.DAYS).toBe('d');
      expect(TimespanUnit.WEEKS).toBe('w');
      expect(TimespanUnit.MONTHS).toBe('m');
    });

    it('should be immutable at TypeScript level', () => {
      expect(typeof TimespanUnit).toBe('object');
      expect(TimespanUnit.DAYS).toBe('d');
    });
  });

  describe('SortOrder constants', () => {
    it('should provide all sort order values', () => {
      expect(SortOrder.DATE_DESC).toBe('datedesc');
      expect(SortOrder.DATE_ASC).toBe('dateasc');
      expect(SortOrder.TONE_DESC).toBe('tonedesc');
      expect(SortOrder.TONE_ASC).toBe('toneasc');
      expect(SortOrder.HYBRID_RELEVANCE).toBe('hybridrel');
    });

    it('should be immutable at TypeScript level', () => {
      expect(typeof SortOrder).toBe('object');
      expect(SortOrder.DATE_DESC).toBe('datedesc');
    });
  });
});

describe('Enhanced Validation Functions', () => {
  describe('isValidTimespan', () => {
    it('should validate correct timespan formats', () => {
      expect(isValidTimespan('1min')).toBe(true);
      expect(isValidTimespan('30min')).toBe(true);
      expect(isValidTimespan('1h')).toBe(true);
      expect(isValidTimespan('24h')).toBe(true);
      expect(isValidTimespan('1d')).toBe(true);
      expect(isValidTimespan('7d')).toBe(true);
      expect(isValidTimespan('1w')).toBe(true);
      expect(isValidTimespan('4w')).toBe(true);
      expect(isValidTimespan('1m')).toBe(true);
      expect(isValidTimespan('12m')).toBe(true);
    });

    it('should reject invalid timespan formats', () => {
      expect(isValidTimespan('1')).toBe(false); // no unit
      expect(isValidTimespan('min')).toBe(false); // no number
      expect(isValidTimespan('1s')).toBe(false); // invalid unit
      expect(isValidTimespan('1.5h')).toBe(false); // decimal
      expect(isValidTimespan('-1d')).toBe(false); // negative
      expect(isValidTimespan('0d')).toBe(true); // zero is technically valid format
      expect(isValidTimespan('')).toBe(false); // empty
      expect(isValidTimespan('1 d')).toBe(false); // space
    });

    it('should handle type safety', () => {
      const validTimespan: TimespanString = '7d';
      expect(isValidTimespan(validTimespan)).toBe(true);
    });
  });

  describe('isValidDateTime', () => {
    it('should validate correct datetime formats', () => {
      expect(isValidDateTime('20230101000000')).toBe(true);
      expect(isValidDateTime('20230630235959')).toBe(true);
      expect(isValidDateTime('20251231120000')).toBe(true);
    });

    it('should reject invalid datetime formats', () => {
      expect(isValidDateTime('2023010100000')).toBe(false); // too short
      expect(isValidDateTime('202301010000000')).toBe(false); // too long
      expect(isValidDateTime('20230101')).toBe(false); // date only
      expect(isValidDateTime('2023-01-01 00:00:00')).toBe(false); // with separators
      expect(isValidDateTime('20230132000000')).toBe(true); // format valid (content validation not implemented)
      expect(isValidDateTime('20230101240000')).toBe(true); // format valid (content validation not implemented)
      expect(isValidDateTime('20230101006000')).toBe(true); // format valid (content validation not implemented)  
      expect(isValidDateTime('20230101000060')).toBe(true); // format valid (content validation not implemented)
      expect(isValidDateTime('')).toBe(false); // empty
      expect(isValidDateTime('abc')).toBe(false); // non-numeric
    });

    it('should handle type safety', () => {
      const validDateTime: DateTimeString = '20230101000000';
      expect(isValidDateTime(validDateTime)).toBe(true);
    });
  });

  describe('isValidMaxRecords', () => {
    it('should validate correct maxrecords values', () => {
      expect(isValidMaxRecords(1)).toBe(true);
      expect(isValidMaxRecords(100)).toBe(true);
      expect(isValidMaxRecords(250)).toBe(true);
    });

    it('should reject invalid maxrecords values', () => {
      expect(isValidMaxRecords(0)).toBe(false); // too low
      expect(isValidMaxRecords(251)).toBe(false); // too high
      expect(isValidMaxRecords(-1)).toBe(false); // negative
      expect(isValidMaxRecords(1.5)).toBe(false); // decimal
      expect(isValidMaxRecords(NaN)).toBe(false); // NaN
      expect(isValidMaxRecords(Infinity)).toBe(false); // Infinity
    });

    it('should reject non-numbers', () => {
      expect(isValidMaxRecords('100' as any)).toBe(false);
      expect(isValidMaxRecords(null as any)).toBe(false);
      expect(isValidMaxRecords(undefined as any)).toBe(false);
    });
  });

  describe('isValidTimelineSmooth', () => {
    it('should validate correct timelinesmooth values', () => {
      expect(isValidTimelineSmooth(1)).toBe(true);
      expect(isValidTimelineSmooth(15)).toBe(true);
      expect(isValidTimelineSmooth(30)).toBe(true);
    });

    it('should reject invalid timelinesmooth values', () => {
      expect(isValidTimelineSmooth(0)).toBe(false); // too low
      expect(isValidTimelineSmooth(31)).toBe(false); // too high
      expect(isValidTimelineSmooth(-1)).toBe(false); // negative
      expect(isValidTimelineSmooth(1.5)).toBe(false); // decimal
      expect(isValidTimelineSmooth(NaN)).toBe(false); // NaN
      expect(isValidTimelineSmooth(Infinity)).toBe(false); // Infinity
    });

    it('should reject non-numbers', () => {
      expect(isValidTimelineSmooth('5' as any)).toBe(false);
      expect(isValidTimelineSmooth(null as any)).toBe(false);
      expect(isValidTimelineSmooth(undefined as any)).toBe(false);
    });
  });
});

describe('Type Safety', () => {
  it('should enforce TimespanString format at compile time', () => {
    // These should compile without errors
    const validTimespans: TimespanString[] = ['1min', '24h', '7d', '4w', '12m'];
    expect(validTimespans).toBeDefined();

    // Runtime validation should still work
    validTimespans.forEach(timespan => {
      expect(isValidTimespan(timespan)).toBe(true);
    });
  });

  it('should enforce DateTimeString format at compile time', () => {
    // These should compile without errors
    const validDateTimes: DateTimeString[] = [
      '20230101000000',
      '20230630235959',
      '20251231120000'
    ];
    expect(validDateTimes).toBeDefined();

    // Runtime validation should still work
    validDateTimes.forEach(dateTime => {
      expect(isValidDateTime(dateTime)).toBe(true);
    });
  });

  it('should provide const assertion benefits', () => {
    // Test that const assertions prevent reassignment
    const mode = Mode.ARTICLE_LIST;
    expect(mode).toBe('artlist');

    // Type should be literal 'artlist', not string
    const modeKeys = Object.keys(Mode);
    expect(modeKeys.length).toBeGreaterThan(0);
    expect(modeKeys.includes('ARTICLE_LIST')).toBe(true);
  });
});

describe('Enhanced Types Integration', () => {
  it('should work with existing enum values', () => {
    // Test that enhanced types are compatible with original enum values
    expect(Mode.ARTICLE_LIST).toBe('artlist');
    expect(Format.JSON).toBe('json');
    expect(TimespanUnit.DAYS).toBe('d');
    expect(SortOrder.DATE_DESC).toBe('datedesc');
  });

  it('should provide better intellisense', () => {
    // Test that all constant objects have expected properties
    const modeKeys = Object.keys(Mode);
    expect(modeKeys).toContain('ARTICLE_LIST');
    expect(modeKeys).toContain('TIMELINE_VOLUME');
    expect(modeKeys).toContain('TONE_CHART');

    const formatKeys = Object.keys(Format);
    expect(formatKeys).toContain('JSON');
    expect(formatKeys).toContain('HTML');
    expect(formatKeys).toContain('CSV');

    const timespanKeys = Object.keys(TimespanUnit);
    expect(timespanKeys).toContain('MINUTES');
    expect(timespanKeys).toContain('HOURS');
    expect(timespanKeys).toContain('DAYS');

    const sortKeys = Object.keys(SortOrder);
    expect(sortKeys).toContain('DATE_DESC');
    expect(sortKeys).toContain('TONE_ASC');
  });
});