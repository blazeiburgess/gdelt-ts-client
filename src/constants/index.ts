/**
 * Constants for the GDELT API
 */

/**
 * Base URL for the GDELT API
 */
export const API_BASE_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

/**
 * Enum for the different output modes of the GDELT API
 * @enum {string}
 */
export enum EMode {
  /**
   * Simple list of news articles that matched the query
   */
  articleList = 'artlist',
  
  /**
   * High design visual layout of articles with social sharing images
   */
  articleGallery = 'artgallery',
  
  /**
   * Displays all matching images processed by GDELT Visual Global Knowledge Graph
   */
  imageCollage = 'imagecollage',
  
  /**
   * Same as imageCollage but with additional information about each image
   */
  imageCollageInfo = 'imagecollageinfo',
  
  /**
   * High design visual layout of images
   */
  imageGallery = 'imagegallery',
  
  /**
   * List of social sharing images from matching articles
   */
  imageCollageShare = 'imagecollagesshare',
  
  /**
   * Timeline of news coverage volume by day/hour/15 minutes
   */
  timelineVolume = 'timelinevol',
  
  /**
   * Same as timelineVolume but returns raw counts instead of percentages
   */
  timelineVolumeRaw = 'timelinevolraw',
  
  /**
   * Same as timelineVolume but displays top 10 most relevant articles for each time step
   */
  timelineVolumeInfo = 'timelinevolinfo',
  
  /**
   * Timeline of average tone of matching coverage
   */
  timelineTone = 'timelinetone',
  
  /**
   * Timeline of coverage volume broken down by language
   */
  timelineLanguage = 'timelinelang',
  
  /**
   * Timeline of coverage volume broken down by source country
   */
  timelineSourceCountry = 'timelinesourcecountry',
  
  /**
   * Emotional histogram showing tonal distribution of coverage
   */
  toneChart = 'tonechart',
  
  /**
   * Word cloud of image tags from VGKG-processed images
   */
  wordCloudImageTags = 'wordcloudimagetags',
  
  /**
   * Word cloud of image web tags from VGKG-processed images
   */
  wordCloudImageWebTags = 'wordcloudimagewebtags'
}

/**
 * Enum for the different output formats of the GDELT API
 * @enum {string}
 */
export enum EFormat {
  /**
   * Browser-based visualization or display
   */
  html = 'html',
  
  /**
   * Comma-delimited format
   */
  csv = 'csv',
  
  /**
   * RSS 2.0 format (only available in ArticleList mode)
   */
  rss = 'rss',
  
  /**
   * Extended RSS format with mobile/AMP versions (only available in ArticleList mode)
   */
  rssArchive = 'rssarchive',
  
  /**
   * JSON format
   */
  json = 'json',
  
  /**
   * JSONP format
   */
  jsonp = 'jsonp',
  
  /**
   * JSONFeed 1.0 format (only available in ArticleList mode)
   */
  jsonFeed = 'jsonfeed'
}

/**
 * Enum for the different timespan units of the GDELT API
 * @enum {string}
 */
export enum ETimespanUnit {
  /**
   * Minutes
   */
  minutes = 'min',
  
  /**
   * Hours
   */
  hours = 'h',
  
  /**
   * Days
   */
  days = 'd',
  
  /**
   * Weeks
   */
  weeks = 'w',
  
  /**
   * Months
   */
  months = 'm'
}

/**
 * Enum for the different sort options of the GDELT API
 * @enum {string}
 */
export enum ESort {
  /**
   * Sort by date, newest first
   */
  dateDesc = 'datedesc',
  
  /**
   * Sort by date, oldest first
   */
  dateAsc = 'dateasc',
  
  /**
   * Sort by tone, most positive first
   */
  toneDesc = 'tonedesc',
  
  /**
   * Sort by tone, most negative first
   */
  toneAsc = 'toneasc',
  
  /**
   * Default relevance sorting mode
   */
  hybridRelevance = 'hybridrel'
}

/**
 * Enum for the different translation options of the GDELT API
 * @enum {string}
 */
export enum ETranslation {
  /**
   * Google Translate Widget
   */
  googleTranslate = 'googtrans'
}

/**
 * Enum for the different time zoom options of the GDELT API
 * @enum {string}
 */
export enum ETimeZoom {
  /**
   * Enable interactive zooming
   */
  enabled = 'yes',
  
  /**
   * Disable interactive zooming
   */
  disabled = 'no'
}

/**
 * Comprehensive mapping of country abbreviations and aliases to their full names
 * This helps with intelligent search suggestions when users provide common abbreviations
 */
export const COUNTRY_ABBREVIATIONS: Record<string, string[]> = {
  // Major countries and their common abbreviations
  'usa': ['united states', 'america', 'united states of america'],
  'us': ['united states', 'america'],
  'uk': ['united kingdom', 'britain', 'great britain', 'england'],
  'uae': ['united arab emirates', 'emirates'],
  'ussr': ['russia', 'soviet union', 'soviet'],
  'prc': ['china', 'peoples republic of china', 'peoples republic'],
  'dprk': ['north korea', 'korea', 'democratic peoples republic of korea'],
  'rok': ['south korea', 'korea', 'republic of korea'],
  'ddr': ['east germany', 'germany', 'german democratic republic'],
  'frg': ['west germany', 'germany', 'federal republic of germany'],
  'cz': ['czech republic', 'czechia', 'czech'],
  'sk': ['slovakia', 'slovak republic'],
  'ba': ['bosnia', 'bosnia and herzegovina'],
  'mk': ['macedonia', 'north macedonia'],
  'me': ['montenegro'],
  'rs': ['serbia'],
  'hr': ['croatia'],
  'si': ['slovenia'],
  'ee': ['estonia'],
  'lv': ['latvia'],
  'lt': ['lithuania'],
  'md': ['moldova'],
  'by': ['belarus'],
  'ua': ['ukraine'],
  'ge': ['georgia'],
  'am': ['armenia'],
  'az': ['azerbaijan'],
  'kz': ['kazakhstan'],
  'uz': ['uzbekistan'],
  'tm': ['turkmenistan'],
  'kg': ['kyrgyzstan'],
  'tj': ['tajikistan'],
  'af': ['afghanistan'],
  'pk': ['pakistan'],
  'in': ['india'],
  'bd': ['bangladesh'],
  'lk': ['sri lanka'],
  'np': ['nepal'],
  'bt': ['bhutan'],
  'mv': ['maldives'],
  'mm': ['myanmar', 'burma'],
  'th': ['thailand'],
  'la': ['laos'],
  'kh': ['cambodia'],
  'vn': ['vietnam'],
  'my': ['malaysia'],
  'sg': ['singapore'],
  'bn': ['brunei'],
  'id': ['indonesia'],
  'tl': ['timor-leste', 'east timor'],
  'ph': ['philippines'],
  'cn': ['china'],
  'kp': ['north korea'],
  'kr': ['south korea'],
  'jp': ['japan'],
  'mn': ['mongolia'],
  'tw': ['taiwan'],
  'hk': ['hong kong'],
  'mo': ['macau'],
  'au': ['australia'],
  'nz': ['new zealand'],
  'pg': ['papua new guinea'],
  'fj': ['fiji'],
  'sb': ['solomon islands'],
  'vu': ['vanuatu'],
  'nc': ['new caledonia'],
  'pf': ['french polynesia'],
  'ws': ['samoa'],
  'to': ['tonga'],
  'tv': ['tuvalu'],
  'ki': ['kiribati'],
  'nr': ['nauru'],
  'pw': ['palau'],
  'fm': ['micronesia'],
  'mh': ['marshall islands'],
  'ca': ['canada'],
  'mx': ['mexico'],
  'gt': ['guatemala'],
  'bz': ['belize'],
  'sv': ['el salvador'],
  'hn': ['honduras'],
  'ni': ['nicaragua'],
  'cr': ['costa rica'],
  'pa': ['panama'],
  'cu': ['cuba'],
  'jm': ['jamaica'],
  'ht': ['haiti'],
  'do': ['dominican republic'],
  'tt': ['trinidad and tobago'],
  'bb': ['barbados'],
  'gd': ['grenada'],
  'lc': ['saint lucia'],
  'vc': ['saint vincent'],
  'ag': ['antigua and barbuda'],
  'kn': ['saint kitts'],
  'dm': ['dominica'],
  'bs': ['bahamas'],
  'br': ['brazil'],
  'ar': ['argentina'],
  'cl': ['chile'],
  'pe': ['peru'],
  'bo': ['bolivia'],
  'py': ['paraguay'],
  'uy': ['uruguay'],
  'co': ['colombia'],
  've': ['venezuela'],
  'gy': ['guyana'],
  'sr': ['suriname'],
  'gf': ['french guiana'],
  'ec': ['ecuador'],
  'fr': ['france'],
  'de': ['germany'],
  'it': ['italy'],
  'es': ['spain'],
  'pt': ['portugal'],
  'ch': ['switzerland'],
  'at': ['austria'],
  'be': ['belgium'],
  'nl': ['netherlands', 'holland'],
  'lu': ['luxembourg'],
  'ie': ['ireland'],
  'is': ['iceland'],
  'no': ['norway'],
  'se': ['sweden'],
  'fi': ['finland'],
  'dk': ['denmark'],
  'pl': ['poland'],
  'hu': ['hungary'],
  'ro': ['romania'],
  'bg': ['bulgaria'],
  'gr': ['greece'],
  'al': ['albania'],
  'mt': ['malta'],
  'cy': ['cyprus'],
  'tr': ['turkey'],
  'sy': ['syria'],
  'lb': ['lebanon'],
  'il': ['israel'],
  'ps': ['palestine'],
  'jo': ['jordan'],
  'iq': ['iraq'],
  'ir': ['iran'],
  'sa': ['saudi arabia'],
  'ye': ['yemen'],
  'om': ['oman'],
  'qa': ['qatar'],
  'bh': ['bahrain'],
  'kw': ['kuwait'],
  'ae': ['united arab emirates'],
  'eg': ['egypt'],
  'ly': ['libya'],
  'tn': ['tunisia'],
  'dz': ['algeria'],
  'ma': ['morocco'],
  'mr': ['mauritania'],
  'ml': ['mali'],
  'bf': ['burkina faso'],
  'ne': ['niger'],
  'td': ['chad'],
  'sd': ['sudan'],
  'ss': ['south sudan'],
  'cf': ['central african republic'],
  'cm': ['cameroon'],
  'ng': ['nigeria'],
  'bj': ['benin'],
  'tg': ['togo'],
  'gh': ['ghana'],
  'ci': ['ivory coast', 'cote divoire'],
  'lr': ['liberia'],
  'sl': ['sierra leone'],
  'gn': ['guinea'],
  'gw': ['guinea-bissau'],
  'cv': ['cape verde'],
  'sn': ['senegal'],
  'gm': ['gambia'],
  'et': ['ethiopia'],
  'er': ['eritrea'],
  'dj': ['djibouti'],
  'so': ['somalia'],
  'ke': ['kenya'],
  'ug': ['uganda'],
  'rw': ['rwanda'],
  'bi': ['burundi'],
  'tz': ['tanzania'],
  'mw': ['malawi'],
  'zm': ['zambia'],
  'zw': ['zimbabwe'],
  'bw': ['botswana'],
  'na': ['namibia'],
  'za': ['south africa'],
  'ls': ['lesotho'],
  'sz': ['swaziland', 'eswatini'],
  'mg': ['madagascar'],
  'mu': ['mauritius'],
  'sc': ['seychelles'],
  'km': ['comoros'],
  'ao': ['angola'],
  'mz': ['mozambique'],
  'cd': ['democratic republic of congo', 'congo'],
  'cg': ['republic of congo', 'congo'],
  'ga': ['gabon'],
  'gq': ['equatorial guinea'],
  'st': ['sao tome'],
  'ru': ['russia'],
};

/**
 * Common language abbreviations and their full names
 */
export const LANGUAGE_ABBREVIATIONS: Record<string, string[]> = {
  'en': ['english'],
  'es': ['spanish', 'espanol'],
  'fr': ['french', 'francais'],
  'de': ['german', 'deutsch'],
  'it': ['italian', 'italiano'],
  'pt': ['portuguese', 'portugues'],
  'ru': ['russian'],
  'zh': ['chinese', 'mandarin'],
  'ja': ['japanese'],
  'ko': ['korean'],
  'ar': ['arabic'],
  'hi': ['hindi'],
  'ur': ['urdu'],
  'fa': ['persian', 'farsi'],
  'tr': ['turkish'],
  'pl': ['polish'],
  'nl': ['dutch'],
  'sv': ['swedish'],
  'no': ['norwegian'],
  'da': ['danish'],
  'fi': ['finnish'],
  'cs': ['czech'],
  'sk': ['slovak'],
  'hu': ['hungarian'],
  'ro': ['romanian'],
  'bg': ['bulgarian'],
  'hr': ['croatian'],
  'sr': ['serbian'],
  'sl': ['slovenian'],
  'et': ['estonian'],
  'lv': ['latvian'],
  'lt': ['lithuanian'],
  'el': ['greek'],
  'he': ['hebrew'],
  'th': ['thai'],
  'vi': ['vietnamese'],
  'id': ['indonesian'],
  'ms': ['malay'],
  'tl': ['tagalog', 'filipino'],
  'bn': ['bengali'],
  'ta': ['tamil'],
  'te': ['telugu'],
  'mr': ['marathi'],
  'gu': ['gujarati'],
  'kn': ['kannada'],
  'ml': ['malayalam'],
  'pa': ['punjabi'],
  'ne': ['nepali'],
  'si': ['sinhala'],
  'my': ['burmese'],
  'km': ['khmer'],
  'lo': ['lao'],
  'ka': ['georgian'],
  'hy': ['armenian'],
  'az': ['azerbaijani'],
  'kk': ['kazakh'],
  'ky': ['kyrgyz'],
  'uz': ['uzbek'],
  'tg': ['tajik'],
  'tk': ['turkmen'],
  'mn': ['mongolian'],
  'bo': ['tibetan'],
  'dz': ['dzongkha'],
  'ps': ['pashto'],
  'sd': ['sindhi'],
  'bal': ['balochi'],
  'ku': ['kurdish'],
  'ckb': ['sorani'],
  'am': ['amharic'],
  'ti': ['tigrinya'],
  'om': ['oromo'],
  'so': ['somali'],
  'sw': ['swahili'],
  'zu': ['zulu'],
  'xh': ['xhosa'],
  'af': ['afrikaans'],
  'ny': ['chichewa'],
  'sn': ['shona'],
  'rw': ['kinyarwanda'],
  'rn': ['kirundi'],
  'lg': ['luganda'],
  'wo': ['wolof'],
  'ha': ['hausa'],
  'yo': ['yoruba'],
  'ig': ['igbo'],
  'ff': ['fulah'],
  'bm': ['bambara'],
  'dyu': ['dyula'],
  'ee': ['ewe'],
  'tw': ['twi'],
  'ak': ['akan'],
  'kr': ['kanuri'],
  'mos': ['mossi'],
  'gur': ['frafra'],
  'dag': ['dagbani'],
  'kab': ['kabyle'],
  'ber': ['berber'],
  'shi': ['tashelhit'],
  'rif': ['tarifit'],
  'zgh': ['standard moroccan tamazight']
};

/**
 * Common theme abbreviations and their full names
 */
export const THEME_ABBREVIATIONS: Record<string, string[]> = {
  'tax': ['taxation', 'fiscal', 'revenue'],
  'econ': ['economic', 'economy', 'financial'],
  'pol': ['political', 'politics', 'government'],
  'mil': ['military', 'defense', 'armed forces'],
  'env': ['environment', 'environmental', 'climate'],
  'health': ['medical', 'healthcare', 'disease'],
  'edu': ['education', 'school', 'university'],
  'tech': ['technology', 'digital', 'cyber'],
  'energy': ['oil', 'gas', 'renewable', 'nuclear'],
  'trade': ['commerce', 'business', 'market'],
  'terror': ['terrorism', 'extremism', 'violence'],
  'conflict': ['war', 'battle', 'fighting'],
  'peace': ['negotiations', 'diplomacy', 'treaty'],
  'human': ['rights', 'civil', 'freedom'],
  'media': ['journalism', 'press', 'news'],
  'religion': ['faith', 'church', 'mosque', 'temple'],
  'culture': ['art', 'music', 'literature'],
  'sports': ['athletics', 'competition', 'games'],
  'crime': ['criminal', 'illegal', 'law enforcement'],
  'disaster': ['natural', 'emergency', 'catastrophe'],
  'migration': ['refugee', 'immigration', 'displacement'],
  'protest': ['demonstration', 'rally', 'activism'],
  'election': ['voting', 'campaign', 'democracy'],
  'corruption': ['fraud', 'bribery', 'scandal']
};