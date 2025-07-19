/**
 * Tests for the Query Builder functionality
 */

import { 
  QueryBuilder,
  ArticleQueryBuilder,
  ImageQueryBuilder,
  QueryHelpers,
  createQuery,
  createArticleQuery,
  createImageQuery,
  phrase,
  anyOf,
  exclude,
  fromDomain,
  fromCountry,
  inLanguage,
  withTone,
  withTheme,
  isValidQuery,
  hasBalancedQuotes,
  getQueryComplexity
} from '../types/query-builder';

describe('QueryBuilder', () => {
  let builder: QueryBuilder;

  beforeEach(() => {
    builder = new QueryBuilder();
  });

  describe('basic query building', () => {
    it('should build simple search query', () => {
      const query = builder.search('climate').build();
      expect(query).toBe('climate');
    });

    it('should build phrase query', () => {
      const query = builder.phrase('climate change').build();
      expect(query).toBe('"climate change"');
    });

    it('should combine multiple terms', () => {
      const query = builder
        .search('climate')
        .search('energy')
        .build();
      expect(query).toBe('climate energy');
    });
  });

  describe('logical operators', () => {
    it('should create OR queries with anyOf', () => {
      const query = builder.anyOf('climate', 'weather', 'temperature').build();
      expect(query).toBe('(climate OR weather OR temperature)');
    });

    it('should handle single term in anyOf', () => {
      const query = builder.anyOf('climate').build();
      expect(query).toBe('climate');
    });

    it('should handle empty anyOf', () => {
      const query = builder.anyOf().build();
      expect(query).toBe('');
    });

    it('should create AND queries with allOf', () => {
      const query = builder.allOf('climate', 'change').build();
      expect(query).toBe('climate change');
    });

    it('should create NOT queries', () => {
      const query = builder.search('climate').not('opinion').build();
      expect(query).toBe('climate -opinion');
    });
  });

  describe('domain and location filters', () => {
    it('should filter by domain', () => {
      const query = builder.fromDomain('cnn.com').build();
      expect(query).toBe('domain:cnn.com');
    });

    it('should filter by exact domain', () => {
      const query = builder.fromDomain('cnn.com', true).build();
      expect(query).toBe('domainis:cnn.com');
    });

    it('should filter by country', () => {
      const query = builder.fromCountry('us').build();
      expect(query).toBe('sourcecountry:us');
    });

    it('should filter by language', () => {
      const query = builder.inLanguage('en').build();
      expect(query).toBe('sourcelang:en');
    });
  });

  describe('tone filters', () => {
    it('should filter by tone greater than', () => {
      const query = builder.withTone('>', 5).build();
      expect(query).toBe('tone>5');
    });

    it('should filter by tone less than', () => {
      const query = builder.withTone('<', -3).build();
      expect(query).toBe('tone<-3');
    });

    it('should filter by exact tone', () => {
      const query = builder.withTone('=', 0).build();
      expect(query).toBe('tone=0');
    });

    it('should filter by positive tone', () => {
      const query = builder.withPositiveTone(3).build();
      expect(query).toBe('tone>3');
    });

    it('should filter by negative tone', () => {
      const query = builder.withNegativeTone(-2).build();
      expect(query).toBe('tone<-2');
    });

    it('should filter by neutral tone', () => {
      const query = builder.withNeutralTone(1).build();
      expect(query).toBe('toneabs<1');
    });

    it('should filter by high emotion', () => {
      const query = builder.withHighEmotion(8).build();
      expect(query).toBe('toneabs>8');
    });
  });

  describe('theme and content filters', () => {
    it('should filter by theme', () => {
      const query = builder.withTheme('env_climate').build();
      expect(query).toBe('theme:ENV_CLIMATE');
    });

    it('should filter by image tag', () => {
      const query = builder.withImageTag('flood').build();
      expect(query).toBe('imagetag:"flood"');
    });

    it('should filter by image web tag', () => {
      const query = builder.withImageWebTag('disaster').build();
      expect(query).toBe('imagewebtag:"disaster"');
    });

    it('should filter by image OCR content', () => {
      const query = builder.withImageOCR('emergency').build();
      expect(query).toBe('imageocrmeta:"emergency"');
    });
  });

  describe('image-specific filters', () => {
    it('should filter by image face count', () => {
      const query = builder.withImageFaceCount('>', 2).build();
      expect(query).toBe('imagenumfaces>2');
    });

    it('should filter by image face tone', () => {
      const query = builder.withImageFaceTone('<', -1).build();
      expect(query).toBe('imagefacetone<-1');
    });

    it('should filter by image web count', () => {
      const query = builder.withImageWebCount('=', 50).build();
      expect(query).toBe('imagewebcount=50');
    });

    it('should filter for novel images', () => {
      const query = builder.withNovelImages(5).build();
      expect(query).toBe('imagewebcount<5');
    });

    it('should filter for popular images', () => {
      const query = builder.withPopularImages(200).build();
      expect(query).toBe('imagewebcount>200');
    });
  });

  describe('advanced features', () => {
    it('should add proximity constraints', () => {
      const query = builder.withProximity(5, 'climate', 'change').build();
      expect(query).toBe('near5:"climate change"');
    });

    it('should handle proximity with less than 2 words', () => {
      const query = builder.withProximity(5, 'climate').build();
      expect(query).toBe('');
    });

    it('should add repeat constraints', () => {
      const query = builder.withRepeat(3, 'urgent').build();
      expect(query).toBe('repeat3:"urgent"');
    });

    it('should add custom query components', () => {
      const query = builder.custom('special:filter').build();
      expect(query).toBe('special:filter');
    });

    it('should group components with OR statements', () => {
      const query = builder
        .anyOf('climate', 'change')
        .group()
        .search('energy')
        .build();
      expect(query).toBe('(climate OR change) energy');
    });
    
    it('should not group components without OR statements', () => {
      const query = builder
        .search('climate')
        .search('change')
        .group() // Should not group due to GDELT API limitations
        .search('energy')
        .build();
      expect(query).toBe('climate change energy');
    });

    it('should not group single component', () => {
      const query = builder.search('climate').group().build();
      expect(query).toBe('climate');
    });
  });

  describe('utility methods', () => {
    it('should clear all components', () => {
      const query = builder
        .search('climate')
        .clear()
        .search('energy')
        .build();
      expect(query).toBe('energy');
    });

    it('should get components copy', () => {
      builder.search('climate').search('change');
      const components = builder.getComponents();
      expect(components).toEqual(['climate', 'change']);
      
      // Should be a copy, not reference
      components.push('test');
      expect(builder.getComponents()).toEqual(['climate', 'change']);
    });

    it('should check if empty', () => {
      expect(builder.isEmpty()).toBe(true);
      builder.search('climate');
      expect(builder.isEmpty()).toBe(false);
    });
  });

  describe('complex query building', () => {
    it('should build complex multi-filter query', () => {
      const query = builder
        .phrase('renewable energy')
        .anyOf('solar', 'wind', 'hydro')
        .fromCountry('germany')
        .withPositiveTone(3)
        .not('opinion')
        .build();
      
      expect(query).toBe('"renewable energy" (solar OR wind OR hydro) sourcecountry:germany tone>3 -opinion');
    });
  });
});

describe('ArticleQueryBuilder', () => {
  let builder: ArticleQueryBuilder;

  beforeEach(() => {
    builder = new ArticleQueryBuilder();
  });

  it('should create breaking news queries', () => {
    const query = builder.breakingNews().build();
    expect(query).toBe('(breaking OR urgent OR just in OR developing)');
  });

  it('should create opinion queries', () => {
    const query = builder.opinions().build();
    expect(query).toBe('(opinion OR editorial OR commentary OR analysis)');
  });

  it('should create local news queries', () => {
    const query = builder.localNews().build();
    expect(query).toBe('local');
  });

  it('should create local news queries with location', () => {
    const query = builder.localNews('seattle').build();
    expect(query).toBe('local seattle');
  });
});

describe('ImageQueryBuilder', () => {
  let builder: ImageQueryBuilder;

  beforeEach(() => {
    builder = new ImageQueryBuilder();
  });

  it('should create violent content queries', () => {
    const query = builder.violentContent().build();
    expect(query).toBe('imagetag:"safesearchviolence"');
  });

  it('should create medical content queries', () => {
    const query = builder.medicalContent().build();
    expect(query).toBe('imagetag:"safesearchmedical"');
  });

  it('should create disaster queries', () => {
    const query = builder.disasters().build();
    expect(query).toBe('(imagetag:"flood" OR imagetag:"fire" OR imagetag:"earthquake" OR imagetag:"rubble")');
  });

  it('should create political event queries', () => {
    const query = builder.politicalEvents().build();
    expect(query).toBe('(imagetag:"crowd" OR imagetag:"protest" OR imagetag:"rally" OR imagetag:"podium")');
  });

  it('should create positive image queries', () => {
    const query = builder.positiveImages().build();
    expect(query).toBe('imagefacetone>1');
  });

  it('should create negative image queries', () => {
    const query = builder.negativeImages().build();
    expect(query).toBe('imagefacetone<-1');
  });
});

describe('Factory Functions', () => {
  it('should create basic query builder', () => {
    const builder = createQuery();
    expect(builder).toBeInstanceOf(QueryBuilder);
  });

  it('should create article query builder', () => {
    const builder = createArticleQuery();
    expect(builder).toBeInstanceOf(ArticleQueryBuilder);
  });

  it('should create image query builder', () => {
    const builder = createImageQuery();
    expect(builder).toBeInstanceOf(ImageQueryBuilder);
  });
});

describe('Helper Functions', () => {
  it('should create phrase queries', () => {
    expect(phrase('climate change')).toBe('"climate change"');
  });

  it('should create anyOf queries', () => {
    expect(anyOf('a', 'b', 'c')).toBe('(a OR b OR c)');
    expect(anyOf('single')).toBe('single');
    expect(anyOf()).toBe('');
  });

  it('should create exclude queries', () => {
    expect(exclude('opinion')).toBe('-opinion');
  });

  it('should create domain filters', () => {
    expect(fromDomain('cnn.com')).toBe('domain:cnn.com');
    expect(fromDomain('cnn.com', true)).toBe('domainis:cnn.com');
  });

  it('should create country filters', () => {
    expect(fromCountry('us')).toBe('sourcecountry:us');
  });

  it('should create language filters', () => {
    expect(inLanguage('en')).toBe('sourcelang:en');
  });

  it('should create tone filters', () => {
    expect(withTone('>', 5)).toBe('tone>5');
  });

  it('should create theme filters', () => {
    expect(withTheme('climate')).toBe('theme:CLIMATE');
  });
});

describe('Query Validation', () => {
  it('should validate well-formed queries', () => {
    expect(isValidQuery('climate change')).toBe(true);
    expect(isValidQuery('(climate OR weather) AND news')).toBe(true);
    expect(isValidQuery('domain:cnn.com')).toBe(true);
  });

  it('should reject invalid queries', () => {
    expect(isValidQuery('')).toBe(false);
    expect(isValidQuery('   ')).toBe(false);
    expect(isValidQuery('(climate OR weather')).toBe(false); // unbalanced parens
    expect(isValidQuery('climate) OR weather')).toBe(false); // unbalanced parens
  });

  it('should validate balanced quotes', () => {
    expect(hasBalancedQuotes('simple query')).toBe(true);
    expect(hasBalancedQuotes('"quoted phrase"')).toBe(true);
    expect(hasBalancedQuotes('"phrase one" and "phrase two"')).toBe(true);
    expect(hasBalancedQuotes('"unbalanced quote')).toBe(false);
    expect(hasBalancedQuotes('quote" without start')).toBe(false);
  });

  it('should calculate query complexity', () => {
    expect(getQueryComplexity('simple')).toBeGreaterThan(0);
    expect(getQueryComplexity('complex OR query AND filter')).toBeGreaterThan(getQueryComplexity('simple'));
    expect(getQueryComplexity('domain:test.com theme:CLIMATE')).toBeGreaterThan(getQueryComplexity('simple query'));
  });
});

describe('QueryHelpers object', () => {
  it('should provide all helper functions', () => {
    expect(QueryHelpers.createQuery).toBeDefined();
    expect(QueryHelpers.createArticleQuery).toBeDefined();
    expect(QueryHelpers.createImageQuery).toBeDefined();
    expect(QueryHelpers.phrase).toBeDefined();
    expect(QueryHelpers.anyOf).toBeDefined();
    expect(QueryHelpers.exclude).toBeDefined();
    expect(QueryHelpers.fromDomain).toBeDefined();
    expect(QueryHelpers.fromCountry).toBeDefined();
    expect(QueryHelpers.inLanguage).toBeDefined();
    expect(QueryHelpers.withTone).toBeDefined();
    expect(QueryHelpers.withTheme).toBeDefined();
    expect(QueryHelpers.isValidQuery).toBeDefined();
    expect(QueryHelpers.hasBalancedQuotes).toBeDefined();
    expect(QueryHelpers.getQueryComplexity).toBeDefined();
  });

  it('should work as expected', () => {
    const builder = QueryHelpers.createQuery();
    expect(builder).toBeInstanceOf(QueryBuilder);
    
    const query = builder.phrase('test').build();
    expect(query).toBe('"test"');
  });
});