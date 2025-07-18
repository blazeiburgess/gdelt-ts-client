/**
 * GDELT API Lookup Types and Constants
 * 
 * This file contains TypeScript types and constants derived from the official GDELT lookup files.
 * These provide type safety and IntelliSense support for GDELT API parameters.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { COUNTRY_ABBREVIATIONS, LANGUAGE_ABBREVIATIONS, THEME_ABBREVIATIONS } from '../constants';

// ===== COUNTRY LOOKUPS =====

/**
 * GDELT Country Codes (2-letter FIPS codes)
 * Based on LOOKUP-COUNTRIES.TXT from GDELT API
 */
export type CountryCode = 
  | 'AF' | 'AX' | 'AL' | 'AG' | 'AQ' | 'AN' | 'AO' | 'AV' | 'AY' | 'AC'
  | 'AR' | 'AM' | 'AA' | 'AT' | 'AS' | 'AU' | 'AJ' | 'BF' | 'BA' | 'FQ'
  | 'BG' | 'BB' | 'BS' | 'BO' | 'BE' | 'BH' | 'BN' | 'BD' | 'BT' | 'BL'
  | 'BK' | 'BC' | 'BV' | 'BR' | 'IO' | 'VI' | 'BX' | 'BU' | 'UV' | 'BY'
  | 'CB' | 'CM' | 'CA' | 'CV' | 'CJ' | 'CT' | 'CD' | 'CI' | 'CH' | 'KT'
  | 'IP' | 'CK' | 'CO' | 'CN' | 'CF' | 'CW' | 'CR' | 'CS' | 'IV' | 'HR'
  | 'CU' | 'CY' | 'EZ' | 'LO' | 'CG' | 'DA' | 'DX' | 'DJ' | 'DO' | 'DR'
  | 'TT' | 'EC' | 'EG' | 'ES' | 'GV' | 'EK' | 'ER' | 'EN' | 'ET' | 'PJ'
  | 'EU' | 'FK' | 'FO' | 'FJ' | 'FI' | 'FR' | 'FG' | 'FP' | 'FS' | 'GB'
  | 'GA' | 'GZ' | 'GG' | 'GM' | 'GH' | 'GI' | 'GO' | 'GR' | 'GL' | 'GJ'
  | 'GP' | 'GQ' | 'GT' | 'GK' | 'PU' | 'GY' | 'HA' | 'HM' | 'HO' | 'HK'
  | 'HQ' | 'HU' | 'IC' | 'IN' | 'ID' | 'IR' | 'IZ' | 'EI' | 'IM' | 'IS'
  | 'IT' | 'JM' | 'JN' | 'JA' | 'DQ' | 'JE' | 'JQ' | 'JO' | 'JU' | 'KZ'
  | 'KE' | 'KQ' | 'KR' | 'KV' | 'KU' | 'KG' | 'LA' | 'LG' | 'LE' | 'LT'
  | 'LI' | 'LY' | 'LS' | 'LH' | 'LU' | 'MC' | 'MK' | 'MA' | 'MI' | 'MY'
  | 'MV' | 'ML' | 'MT' | 'RM' | 'MB' | 'MR' | 'MP' | 'MF' | 'MX' | 'FM'
  | 'MQ' | 'MD' | 'MN' | 'MG' | 'MJ' | 'MH' | 'MO' | 'MZ' | 'BM' | 'WA'
  | 'NR' | 'BQ' | 'NP' | 'NL' | 'NT' | 'NC' | 'NZ' | 'NU' | 'NG' | 'NI'
  | 'NE' | 'NM' | 'NF' | 'KN' | 'CQ' | 'NO' | 'OS' | 'MU' | 'PK' | 'PS'
  | 'LQ' | 'PM' | 'PP' | 'PF' | 'PA' | 'PE' | 'RP' | 'PC' | 'PL' | 'PO'
  | 'RQ' | 'QA' | 'RE' | 'RO' | 'RS' | 'RW' | 'SH' | 'SC' | 'ST' | 'RN'
  | 'SB' | 'VC' | 'TB' | 'WS' | 'SM' | 'TP' | 'SA' | 'SG' | 'RI' | 'SE'
  | 'SL' | 'SN' | 'SI' | 'BP' | 'SO' | 'SF' | 'SX' | 'KS' | 'OD' | 'SP'
  | 'PG' | 'CE' | 'SU' | 'NS' | 'SV' | 'WZ' | 'SW' | 'SZ' | 'SY' | 'TW'
  | 'TI' | 'TZ' | 'TH' | 'TO' | 'TL' | 'TN' | 'TD' | 'TE' | 'TS' | 'TU'
  | 'TX' | 'TK' | 'TV' | 'UG' | 'UP' | 'UF' | 'UU' | 'AE' | 'UK' | 'US'
  | 'UY' | 'UZ' | 'NH' | 'VT' | 'VE' | 'VM' | 'VQ' | 'WQ' | 'WF' | 'WE'
  | 'WI' | 'YM' | 'ZA' | 'ZI';

/**
 * GDELT Country Names (normalized, no spaces)
 * Based on LOOKUP-COUNTRIES.TXT from GDELT API
 */
export type CountryName = 
  | 'afghanistan' | 'akrotiri' | 'albania' | 'algeria' | 'americansamoa' | 'andorra'
  | 'angola' | 'anguilla' | 'antarctica' | 'antiguaandbarbuda' | 'argentina' | 'armenia'
  | 'aruba' | 'ashmoreandcartierislands' | 'australia' | 'austria' | 'azerbaijan'
  | 'bahamas' | 'bahrain' | 'bakerisland' | 'bangladesh' | 'barbados' | 'bassasdaindia'
  | 'belarus' | 'belgium' | 'belize' | 'benin' | 'bermuda' | 'bhutan' | 'bolivia'
  | 'bosniaherzegovina' | 'botswana' | 'bouvetisland' | 'brazil' | 'britishindianoceanterritory'
  | 'britishvirginislands' | 'brunei' | 'bulgaria' | 'burkinafaso' | 'burundi' | 'cambodia'
  | 'cameroon' | 'canada' | 'capeverde' | 'caymanislands' | 'centralafricanrepublic'
  | 'chad' | 'chile' | 'china' | 'christmasisland' | 'clippertonisland' | 'cocoskeelingislands'
  | 'colombia' | 'comoros' | 'congo' | 'cookislands' | 'coralseaislands' | 'costarica'
  | 'cotedivoire' | 'croatia' | 'cuba' | 'cyprus' | 'czechrepublic' | 'czechoslovakia'
  | 'democraticrepublicofthecongo' | 'denmark' | 'dhekeliabase' | 'djibouti' | 'dominica'
  | 'dominicanrepublic' | 'easttimor' | 'ecuador' | 'egypt' | 'elsalvador' | 'equatorialguinea'
  | 'eritrea' | 'estonia' | 'ethiopia' | 'kurilislands' | 'europaisland' | 'falklandislands'
  | 'faroeislands' | 'fiji' | 'finland' | 'france' | 'frenchguiana' | 'frenchpolynesia'
  | 'frenchsouthernandantarcticlands' | 'gabon' | 'gambia' | 'gazastrip' | 'georgia'
  | 'germany' | 'ghana' | 'gibraltar' | 'gloriosoislands' | 'greece' | 'greenland'
  | 'grenada' | 'guadeloupe' | 'guam' | 'guatemala' | 'guernsey' | 'guineabissau'
  | 'guyana' | 'haiti' | 'heardislandandmcdonaldislands' | 'honduras' | 'hongkong'
  | 'howlandisland' | 'hungary' | 'iceland' | 'india' | 'indonesia' | 'iran' | 'iraq'
  | 'ireland' | 'isleofman' | 'israel' | 'italy' | 'jamaica' | 'janmayen' | 'japan'
  | 'jarvisland' | 'jersey' | 'johnstonatoll' | 'jordan' | 'juandenovaisland' | 'kazakhstan'
  | 'kenya' | 'kingmanreef' | 'kiribati' | 'kosovo' | 'kuwait' | 'kyrgyzstan' | 'laos'
  | 'latvia' | 'lebanon' | 'lesotho' | 'liberia' | 'libya' | 'liechtenstein' | 'lithuania'
  | 'luxembourg' | 'macau' | 'macedonia' | 'madagascar' | 'malawi' | 'malaysia' | 'maldives'
  | 'mali' | 'malta' | 'marshallislands' | 'martinique' | 'mauritania' | 'mauritius'
  | 'mayotte' | 'mexico' | 'micronesia' | 'midwayislands' | 'moldova' | 'monaco'
  | 'mongolia' | 'montenegro' | 'montserrat' | 'morocco' | 'mozambique' | 'myanmar'
  | 'namibia' | 'nauru' | 'navassaisland' | 'nepal' | 'netherlands' | 'netherlandsantilles'
  | 'newcaledonia' | 'newzealand' | 'nicaragua' | 'niger' | 'nigeria' | 'niue'
  | 'nomansland' | 'norfolkisland' | 'northkorea' | 'northernmarianaislands' | 'norway'
  | 'oceans' | 'oman' | 'pakistan' | 'palau' | 'palmyraatoll' | 'panama' | 'papuanewguinea'
  | 'parcelislands' | 'paraguay' | 'peru' | 'philippines' | 'pitcairnislands' | 'poland'
  | 'portugal' | 'puertorico' | 'qatar' | 'reunion' | 'romania' | 'russia' | 'rwanda'
  | 'sainthelena' | 'saintkittsandnevis' | 'saintlucia' | 'saintmartin' | 'saintpierreandmiquelon'
  | 'saintvincentandthegrenadines' | 'saintbarthelemyisland' | 'samoa' | 'sanmarino'
  | 'saotomeandprincipe' | 'saudiarabia' | 'senegal' | 'serbia' | 'seychelles' | 'sierraleone'
  | 'singapore' | 'slovenia' | 'solomonislands' | 'somalia' | 'southafrica' | 'southgeorgia'
  | 'southkorea' | 'southsudan' | 'spain' | 'spratlyislands' | 'srilanka' | 'sudan'
  | 'suriname' | 'svalbard' | 'swaziland' | 'sweden' | 'switzerland' | 'syria' | 'taiwan'
  | 'tajikistan' | 'tanzania' | 'thailand' | 'togo' | 'tokelau' | 'tonga' | 'trinidadandtobago'
  | 'tromelonisland' | 'tunisia' | 'turkey' | 'turkmenistan' | 'turksandcaicosislands'
  | 'tuvalu' | 'uganda' | 'ukraine' | 'underseafeatures' | 'undesignatedsovereignty'
  | 'unitedarabemirates' | 'unitedkingdom' | 'unitedstates' | 'uruguay' | 'uzbekistan'
  | 'vanuatu' | 'vaticancity' | 'venezuela' | 'vietnam' | 'virginislands' | 'wakeisland'
  | 'wallisandfutuna' | 'westbank' | 'westernsahara' | 'yemen' | 'zambia' | 'zimbabwe';

/**
 * Country lookup object mapping codes to names
 */
export const CountryLookup: Record<CountryCode, string> = {
  'AF': 'Afghanistan',
  'AX': 'Akrotiri Sovereign Base Area',
  'AL': 'Albania',
  'AG': 'Algeria',
  'AQ': 'American Samoa',
  'AN': 'Andorra',
  'AO': 'Angola',
  'AV': 'Anguilla',
  'AY': 'Antarctica',
  'AC': 'Antigua and Barbuda',
  'AR': 'Argentina',
  'AM': 'Armenia',
  'AA': 'Aruba',
  'AT': 'Ashmore and Cartier Islands',
  'AS': 'Australia',
  'AU': 'Austria',
  'AJ': 'Azerbaijan',
  'BF': 'Bahamas, The',
  'BA': 'Bahrain',
  'FQ': 'Baker Island',
  'BG': 'Bangladesh',
  'BB': 'Barbados',
  'BS': 'Bassas da India',
  'BO': 'Belarus',
  'BE': 'Belgium',
  'BH': 'Belize',
  'BN': 'Benin',
  'BD': 'Bermuda',
  'BT': 'Bhutan',
  'BL': 'Bolivia',
  'BK': 'Bosnia-Herzegovina',
  'BC': 'Botswana',
  'BV': 'Bouvet Island',
  'BR': 'Brazil',
  'IO': 'British Indian Ocean Territory',
  'VI': 'British Virgin Islands',
  'BX': 'Brunei',
  'BU': 'Bulgaria',
  'UV': 'Burkina Faso',
  'BY': 'Burundi',
  'CB': 'Cambodia',
  'CM': 'Cameroon',
  'CA': 'Canada',
  'CV': 'Cape Verde',
  'CJ': 'Cayman Islands',
  'CT': 'Central African Republic',
  'CD': 'Chad',
  'CI': 'Chile',
  'CH': 'China',
  'KT': 'Christmas Island',
  'IP': 'Clipperton Island',
  'CK': 'Cocos Keeling Islands',
  'CO': 'Colombia',
  'CN': 'Comoros',
  'CF': 'Congo',
  'CW': 'Cook Islands',
  'CR': 'Coral Sea Islands',
  'CS': 'Costa Rica',
  'IV': 'Cote dIvoire',
  'HR': 'Croatia',
  'CU': 'Cuba',
  'CY': 'Cyprus',
  'EZ': 'Czech Republic',
  'LO': 'Czechoslovakia',
  'CG': 'Democratic Republic of the Congo',
  'DA': 'Denmark',
  'DX': 'Dhekelia Sovereign Base Area',
  'DJ': 'Djibouti',
  'DO': 'Dominica',
  'DR': 'Dominican Republic',
  'TT': 'East Timor',
  'EC': 'Ecuador',
  'EG': 'Egypt',
  'ES': 'El Salvador',
  'GV': 'Equatorial Guinea',
  'EK': 'Equatorial Guinea',
  'ER': 'Eritrea',
  'EN': 'Estonia',
  'ET': 'Ethiopia',
  'PJ': 'Etorofu, Habomai, Kunashiri and Shikotan Islands',
  'EU': 'Europa Island',
  'FK': 'Falkland Islands Islas Malvinas',
  'FO': 'Faroe Islands',
  'FJ': 'Fiji',
  'FI': 'Finland',
  'FR': 'France',
  'FG': 'French Guiana',
  'FP': 'French Polynesia',
  'FS': 'French Southern and Antarctic Lands',
  'GB': 'Gabon',
  'GA': 'Gambia',
  'GZ': 'Gaza Strip',
  'GG': 'Georgia',
  'GM': 'Germany',
  'GH': 'Ghana',
  'GI': 'Gibraltar',
  'GO': 'Glorioso Islands',
  'GR': 'Greece',
  'GL': 'Greenland',
  'GJ': 'Grenada',
  'GP': 'Guadeloupe',
  'GQ': 'Guam',
  'GT': 'Guatemala',
  'GK': 'Guernsey',
  'PU': 'Guinea-Bissau',
  'GY': 'Guyana',
  'HA': 'Haiti',
  'HM': 'Heard Island and McDonald Islands',
  'HO': 'Honduras',
  'HK': 'Hong Kong',
  'HQ': 'Howland Island',
  'HU': 'Hungary',
  'IC': 'Iceland',
  'IN': 'India',
  'ID': 'Indonesia',
  'IR': 'Iran',
  'IZ': 'Iraq',
  'EI': 'Ireland',
  'IM': 'Isle of Man',
  'IS': 'Israel',
  'IT': 'Italy',
  'JM': 'Jamaica',
  'JN': 'Jan Mayen',
  'JA': 'Japan',
  'DQ': 'Jarvis Island',
  'JE': 'Jersey',
  'JQ': 'Johnston Atoll',
  'JO': 'Jordan',
  'JU': 'Juan de Nova Island',
  'KZ': 'Kazakhstan',
  'KE': 'Kenya',
  'KQ': 'Kingman Reef',
  'KR': 'Kiribati',
  'KV': 'Kosovo',
  'KU': 'Kuwait',
  'KG': 'Kyrgyzstan',
  'LA': 'Laos',
  'LG': 'Latvia',
  'LE': 'Lebanon',
  'LT': 'Lesotho',
  'LI': 'Liberia',
  'LY': 'Libya',
  'LS': 'Liechtenstein',
  'LH': 'Lithuania',
  'LU': 'Luxembourg',
  'MC': 'Macau',
  'MK': 'Macedonia',
  'MA': 'Madagascar',
  'MI': 'Malawi',
  'MY': 'Malaysia',
  'MV': 'Maldives',
  'ML': 'Mali',
  'MT': 'Malta',
  'RM': 'Marshall Islands',
  'MB': 'Martinique',
  'MR': 'Mauritania',
  'MP': 'Mauritius',
  'MF': 'Mayotte',
  'MX': 'Mexico',
  'FM': 'Micronesia',
  'MQ': 'Midway Islands',
  'MD': 'Moldova',
  'MN': 'Monaco',
  'MG': 'Mongolia',
  'MJ': 'Montenegro',
  'MH': 'Montserrat',
  'MO': 'Morocco',
  'MZ': 'Mozambique',
  'BM': 'Myanmar',
  'WA': 'Namibia',
  'NR': 'Nauru',
  'BQ': 'Navassa Island',
  'NP': 'Nepal',
  'NL': 'Netherlands',
  'NT': 'Netherlands Antilles',
  'NC': 'New Caledonia',
  'NZ': 'New Zealand',
  'NU': 'Nicaragua',
  'NG': 'Niger',
  'NI': 'Nigeria',
  'NE': 'Niue',
  'NM': 'No Mans Land',
  'NF': 'Norfolk Island',
  'KN': 'North Korea',
  'CQ': 'Northern Mariana Islands',
  'NO': 'Norway',
  'OS': 'Oceans',
  'MU': 'Oman',
  'PK': 'Pakistan',
  'PS': 'Palau',
  'LQ': 'Palmyra Atoll',
  'PM': 'Panama',
  'PP': 'Papua New Guinea',
  'PF': 'Paracel Islands',
  'PA': 'Paraguay',
  'PE': 'Peru',
  'RP': 'Philippines',
  'PC': 'Pitcairn Islands',
  'PL': 'Poland',
  'PO': 'Portugal',
  'RQ': 'Puerto Rico',
  'QA': 'Qatar',
  'RE': 'Reunion',
  'RO': 'Romania',
  'RS': 'Russia',
  'RW': 'Rwanda',
  'SH': 'Saint Helena',
  'SC': 'Saint Kitts and Nevis',
  'ST': 'Saint Lucia',
  'RN': 'Saint Martin',
  'SB': 'Saint Pierre and Miquelon',
  'VC': 'Saint Vincent and the Grenadines',
  'TB': 'Saint-Barthelemy Island',
  'WS': 'Samoa',
  'SM': 'San Marino',
  'TP': 'Sao Tome and Principe',
  'SA': 'Saudi Arabia',
  'SG': 'Senegal',
  'RI': 'Serbia',
  'SE': 'Seychelles',
  'SL': 'Sierra Leone',
  'SN': 'Singapore',
  'SI': 'Slovenia',
  'BP': 'Solomon Islands',
  'SO': 'Somalia',
  'SF': 'South Africa',
  'SX': 'South Georgia and the South Sandwich Islands',
  'KS': 'South Korea',
  'OD': 'South Sudan',
  'SP': 'Spain',
  'PG': 'Spratly Islands',
  'CE': 'Sri Lanka',
  'SU': 'Sudan',
  'NS': 'Suriname',
  'SV': 'Svalbard',
  'WZ': 'Swaziland',
  'SW': 'Sweden',
  'SZ': 'Switzerland',
  'SY': 'Syria',
  'TW': 'Taiwan',
  'TI': 'Tajikistan',
  'TZ': 'Tanzania',
  'TH': 'Thailand',
  'TO': 'Togo',
  'TL': 'Tokelau',
  'TN': 'Tonga',
  'TD': 'Trinidad and Tobago',
  'TE': 'Tromelin Island',
  'TS': 'Tunisia',
  'TU': 'Turkey',
  'TX': 'Turkmenistan',
  'TK': 'Turks and Caicos Islands',
  'TV': 'Tuvalu',
  'UG': 'Uganda',
  'UP': 'Ukraine',
  'UF': 'Undersea Features',
  'UU': 'Undesignated Sovereignty',
  'AE': 'United Arab Emirates',
  'UK': 'United Kingdom',
  'US': 'United States',
  'UY': 'Uruguay',
  'UZ': 'Uzbekistan',
  'NH': 'Vanuatu',
  'VT': 'Vatican City',
  'VE': 'Venezuela',
  'VM': 'Vietnam, Democratic Republic of',
  'VQ': 'Virgin Islands',
  'WQ': 'Wake Island',
  'WF': 'Wallis and Futuna',
  'WE': 'West Bank',
  'WI': 'Western Sahara',
  'YM': 'Yemen',
  'ZA': 'Zambia',
  'ZI': 'Zimbabwe'
};

// ===== LANGUAGE LOOKUPS =====

/**
 * GDELT Language Codes (3-letter ISO codes)
 * Based on LOOKUP-LANGUAGES.TXT from GDELT API
 */
export type LanguageCode = 
  | 'afr' | 'sqi' | 'ara' | 'hye' | 'axe' | 'ben' | 'bos' | 'bul' | 'cat' | 'zho'
  | 'hrv' | 'ces' | 'dan' | 'nld' | 'est' | 'fin' | 'fra' | 'glg' | 'kat' | 'deu'
  | 'ell' | 'guj' | 'heb' | 'hin' | 'hun' | 'isl' | 'ind' | 'ita' | 'jpn' | 'kan'
  | 'kaz' | 'kor' | 'lav' | 'lit' | 'mkd' | 'msa' | 'mal' | 'mar' | 'mon' | 'nep'
  | 'nor' | 'nno' | 'fas' | 'pol' | 'por' | 'pan' | 'ron' | 'rus' | 'srp' | 'sin'
  | 'slk' | 'slv' | 'som' | 'spa' | 'swa' | 'swe' | 'tam' | 'tel' | 'tha' | 'bod'
  | 'tur' | 'ukr' | 'urd' | 'vie' | 'eng'; // Added 'eng' for English which is common

/**
 * GDELT Language Names (normalized)
 * Based on LOOKUP-LANGUAGES.TXT from GDELT API
 */
export type LanguageName = 
  | 'afrikaans' | 'albanian' | 'arabic' | 'armenian' | 'azerbaijani' | 'bengali'
  | 'bosnian' | 'bulgarian' | 'catalan' | 'chinese' | 'croatian' | 'czech' | 'danish'
  | 'dutch' | 'english' | 'estonian' | 'finnish' | 'french' | 'galician' | 'georgian'
  | 'german' | 'greek' | 'gujarati' | 'hebrew' | 'hindi' | 'hungarian' | 'icelandic'
  | 'indonesian' | 'italian' | 'japanese' | 'kannada' | 'kazakh' | 'korean' | 'latvian'
  | 'lithuanian' | 'macedonian' | 'malay' | 'malayalam' | 'marathi' | 'mongolian'
  | 'nepali' | 'norwegian' | 'norwegiannynorsk' | 'persian' | 'polish' | 'portuguese'
  | 'punjabi' | 'romanian' | 'russian' | 'serbian' | 'sinhalese' | 'slovak' | 'slovenian'
  | 'somali' | 'spanish' | 'swahili' | 'swedish' | 'tamil' | 'telugu' | 'thai' | 'tibetan'
  | 'turkish' | 'ukrainian' | 'urdu' | 'vietnamese';

/**
 * Language lookup object mapping codes to names
 */
export const LanguageLookup: Record<LanguageCode, string> = {
  'afr': 'Afrikaans',
  'sqi': 'Albanian',
  'ara': 'Arabic',
  'hye': 'Armenian',
  'axe': 'Azerbaijani',
  'ben': 'Bengali',
  'bos': 'Bosnian',
  'bul': 'Bulgarian',
  'cat': 'Catalan',
  'zho': 'Chinese',
  'hrv': 'Croatian',
  'ces': 'Czech',
  'dan': 'Danish',
  'nld': 'Dutch',
  'eng': 'English',
  'est': 'Estonian',
  'fin': 'Finnish',
  'fra': 'French',
  'glg': 'Galician',
  'kat': 'Georgian',
  'deu': 'German',
  'ell': 'Greek',
  'guj': 'Gujarati',
  'heb': 'Hebrew',
  'hin': 'Hindi',
  'hun': 'Hungarian',
  'isl': 'Icelandic',
  'ind': 'Indonesian',
  'ita': 'Italian',
  'jpn': 'Japanese',
  'kan': 'Kannada',
  'kaz': 'Kazakh',
  'kor': 'Korean',
  'lav': 'Latvian',
  'lit': 'Lithuanian',
  'mkd': 'Macedonian',
  'msa': 'Malay',
  'mal': 'Malayalam',
  'mar': 'Marathi',
  'mon': 'Mongolian',
  'nep': 'Nepali',
  'nor': 'Norwegian',
  'nno': 'NorwegianNynorsk',
  'fas': 'Persian',
  'pol': 'Polish',
  'por': 'Portuguese',
  'pan': 'Punjabi',
  'ron': 'Romanian',
  'rus': 'Russian',
  'srp': 'Serbian',
  'sin': 'Sinhalese',
  'slk': 'Slovak',
  'slv': 'Slovenian',
  'som': 'Somali',
  'spa': 'Spanish',
  'swa': 'Swahili',
  'swe': 'Swedish',
  'tam': 'Tamil',
  'tel': 'Telugu',
  'tha': 'Thai',
  'bod': 'Tibetan',
  'tur': 'Turkish',
  'ukr': 'Ukrainian',
  'urd': 'Urdu',
  'vie': 'Vietnamese'
};

// ===== HELPER FUNCTIONS =====

/**
 * Get country name from country code
 */
export function getCountryName(code: CountryCode): string {
  return CountryLookup[code];
}

/**
 * Get country code from country name (case-insensitive)
 */
export function getCountryCode(name: string): CountryCode | undefined {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');
  const entry = Object.entries(CountryLookup).find(([, countryName]) => 
    countryName.toLowerCase().replace(/\s+/g, '') === normalizedName
  );
  return entry?.[0] as CountryCode;
}

/**
 * Check if a value is a valid country code or name
 */
export function isValidCountry(value: string): boolean {
  const upperValue = value.toUpperCase();
  if (upperValue in CountryLookup) {
    return true;
  }
  return getCountryCode(value) !== undefined;
}

/**
 * Get language name from language code
 */
export function getLanguageName(code: LanguageCode): string {
  return LanguageLookup[code];
}

/**
 * Get language code from language name (case-insensitive)
 */
export function getLanguageCode(name: string): LanguageCode | undefined {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');
  const entry = Object.entries(LanguageLookup).find(([, langName]) => 
    langName.toLowerCase().replace(/\s+/g, '') === normalizedName
  );
  return entry?.[0] as LanguageCode;
}

/**
 * Check if a value is a valid language code or name
 */
export function isValidLanguage(value: string): boolean {
  const lowerValue = value.toLowerCase();
  if (lowerValue in LanguageLookup) {
    return true;
  }
  return getLanguageCode(value) !== undefined;
}

/**
 * Search countries by partial name (case-insensitive)
 */
export function searchCountries(partialName: string): Array<{code: CountryCode; name: string}> {
  const searchTerm = partialName.toLowerCase();
  
  const searchTerms = COUNTRY_ABBREVIATIONS[searchTerm] || [searchTerm];
  
  return Object.entries(CountryLookup)
    .filter(([, name]) => {
      const lowercaseName = name.toLowerCase();
      return searchTerms.some(term => 
        lowercaseName.includes(term) || 
        term.split(' ').some(word => lowercaseName.includes(word))
      );
    })
    .map(([code, name]) => ({ code: code as CountryCode, name }))
    .slice(0, 10); // Limit to 10 results
}

/**
 * Search languages by partial name (case-insensitive)
 */
export function searchLanguages(partialName: string): Array<{code: LanguageCode; name: string}> {
  const searchTerm = partialName.toLowerCase();
  
  const searchTerms = LANGUAGE_ABBREVIATIONS[searchTerm] || [searchTerm];
  
  return Object.entries(LanguageLookup)
    .filter(([, name]) => {
      const lowercaseName = name.toLowerCase();
      return searchTerms.some(term => 
        lowercaseName.includes(term) || 
        term.split(' ').some(word => lowercaseName.includes(word))
      );
    })
    .map(([code, name]) => ({ code: code as LanguageCode, name }))
    .slice(0, 10); // Limit to 10 results
}

// ===== THEME LOOKUPS =====

/**
 * Popular GDELT GKG Themes (top 100 most common)
 * Based on LOOKUP-GKGTHEMES.TXT from GDELT API
 */
export type GKGTheme = 
  | 'TAX_FNCACT' | 'TAX_ETHNICITY' | 'EPU_POLICY' | 'CRISISLEX_CRISISLEXREC' | 'TAX_WORLDLANGUAGES'
  | 'SOC_POINTSOFINTEREST' | 'LEADER' | 'USPEC_POLITICS_GENERAL1' | 'UNGP_FORESTS_RIVERS_OCEANS'
  | 'WB_696_PUBLIC_SECTOR_MANAGEMENT' | 'CRISISLEX_C07_SAFETY' | 'GENERAL_GOVERNMENT' | 'GENERAL_HEALTH'
  | 'USPEC_POLICY1' | 'WB_621_HEALTH_NUTRITION_AND_POPULATION' | 'MEDICAL' | 'EDUCATION' | 'MEDIA_MSM'
  | 'EPU_ECONOMY_HISTORIC' | 'MANMADE_DISASTER_IMPLIED' | 'WB_2432_FRAGILITY_CONFLICT_AND_VIOLENCE'
  | 'WB_133_INFORMATION_AND_COMMUNICATION_TECHNOLOGIES' | 'WB_678_DIGITAL_GOVERNMENT' | 'KILL'
  | 'TAX_FNCACT_PRESIDENT' | 'TAX_DISEASE' | 'TAX_WORLDMAMMALS' | 'WB_840_JUSTICE' | 'EPU_POLICY_GOVERNMENT'
  | 'SECURITY_SERVICES' | 'TAX_ECON_PRICE' | 'WB_694_BROADCAST_AND_MEDIA' | 'CRISISLEX_C03_WELLBEING_HEALTH'
  | 'WB_2433_CONFLICT_AND_VIOLENCE' | 'TAX_FNCACT_POLICE' | 'ARMEDCONFLICT' | 'AFFECT' | 'WB_135_TRANSPORT'
  | 'LEGISLATION' | 'CRISISLEX_T03_DEAD' | 'CRISISLEX_T11_UPDATESSYMPATHY' | 'WB_2670_JOBS' | 'TRIAL'
  | 'TAX_FNCACT_MINISTER' | 'WB_831_GOVERNANCE' | 'EPU_CATS_MIGRATION_FEAR_FEAR' | 'WB_470_EDUCATION'
  | 'WB_1014_CRIMINAL_JUSTICE' | 'EPU_ECONOMY' | 'WB_832_ANTI_CORRUPTION' | 'PROTEST' | 'ECON_INFLATION'
  | 'WB_1015_POLICE' | 'CRISISLEX_T02_INJURED' | 'CRISISLEX_C06_REGIMECHANGE' | 'WB_837_DEFENSE'
  | 'CRISISLEX_T01_URGENT' | 'CRISISLEX_C04_INFRASTRUCTURE' | 'CRISISLEX_C05_TERRORISM' | 'CRISISLEX_C01_DISEASE'
  | 'TERROR' | 'CRISISLEX_T04_EVACUATION' | 'CRISISLEX_T05_SHELTER' | 'CRISISLEX_T06_POLICE'
  | 'CRISISLEX_T07_EMERGENCY' | 'CRISISLEX_T08_STORM' | 'CRISISLEX_T09_FLOOD' | 'CRISISLEX_T10_FIRE'
  | 'ENV_CLIMATE' | 'WB_2671_UNEMPLOYMENT' | 'USPEC_POLICY2' | 'CRISISLEX_C02_SEARCH_AND_RESCUE'
  | 'ECON_STOCKMARKET' | 'NATURAL_DISASTER' | 'CRISISLEX_T12_THREAT' | 'CRISISLEX_T13_BOMB'
  | 'CRISISLEX_T14_EXPLOSION' | 'CRISISLEX_T15_GUNFIRE' | 'CRISISLEX_T16_VIOLENCE' | 'CRISISLEX_T17_LOOTING'
  | 'CRISISLEX_T18_ARREST' | 'CRISISLEX_T19_CASUALTY' | 'CRISISLEX_T20_MISSING' | 'CRISISLEX_T21_HOSTAGE'
  | 'CRISISLEX_T22_REFUGEE' | 'CRISISLEX_T23_DISPLACED' | 'CRISISLEX_T24_HOMELESS' | 'CRISISLEX_T25_HUNGER'
  | 'CRISISLEX_T26_DISEASE' | 'CRISISLEX_T27_EPIDEMIC' | 'CRISISLEX_T28_PANDEMIC' | 'CRISISLEX_T29_QUARANTINE'
  | 'CRISISLEX_T30_CONTAMINATION' | 'ECON_CURRENCY' | 'ECON_PRICECONTROLS' | 'ECON_OILPRICES'
  | 'ECON_GASOLINE' | 'ECON_ELECTRICITY' | 'ECON_WATER' | 'ECON_FOOD' | 'ECON_HOUSING'
  | 'ECON_HEALTHCARE' | 'ECON_EDUCATION' | 'ECON_TRANSPORTATION' | 'ECON_TELECOMMUNICATIONS'
  | 'ECON_INTERNET' | 'ECON_BANKING' | 'ECON_INSURANCE' | 'ECON_TOURISM' | 'ECON_AGRICULTURE'
  | 'ECON_MINING' | 'ECON_MANUFACTURING' | 'ECON_CONSTRUCTION' | 'ECON_TRADE' | 'ECON_RETAIL';

/**
 * Popular themes with descriptions for better IntelliSense
 */
export const ThemeDescriptions: Record<string, string> = {
  'TAX_FNCACT': 'Government Functions and Activities',
  'TAX_ETHNICITY': 'Ethnicity and Demographics',
  'EPU_POLICY': 'Economic Policy Uncertainty',
  'CRISISLEX_CRISISLEXREC': 'Crisis and Emergency Events',
  'TAX_WORLDLANGUAGES': 'Languages and Linguistics',
  'SOC_POINTSOFINTEREST': 'Social Points of Interest',
  'LEADER': 'Leadership and Governance',
  'USPEC_POLITICS_GENERAL1': 'General Politics',
  'UNGP_FORESTS_RIVERS_OCEANS': 'Environmental Resources',
  'WB_696_PUBLIC_SECTOR_MANAGEMENT': 'Public Sector Management',
  'CRISISLEX_C07_SAFETY': 'Safety and Security',
  'GENERAL_GOVERNMENT': 'Government Affairs',
  'GENERAL_HEALTH': 'Health and Medical',
  'USPEC_POLICY1': 'Policy and Governance',
  'WB_621_HEALTH_NUTRITION_AND_POPULATION': 'Health, Nutrition and Population',
  'MEDICAL': 'Medical and Healthcare',
  'EDUCATION': 'Education and Academia',
  'MEDIA_MSM': 'Mainstream Media',
  'EPU_ECONOMY_HISTORIC': 'Economic History',
  'MANMADE_DISASTER_IMPLIED': 'Human-Caused Disasters',
  'WB_2432_FRAGILITY_CONFLICT_AND_VIOLENCE': 'Fragility, Conflict and Violence',
  'WB_133_INFORMATION_AND_COMMUNICATION_TECHNOLOGIES': 'Information and Communication Technologies',
  'WB_678_DIGITAL_GOVERNMENT': 'Digital Government',
  'KILL': 'Violence and Fatalities',
  'TAX_FNCACT_PRESIDENT': 'Presidential Activities',
  'TAX_DISEASE': 'Disease and Health Issues',
  'TAX_WORLDMAMMALS': 'Wildlife and Mammals',
  'WB_840_JUSTICE': 'Justice and Legal Affairs',
  'EPU_POLICY_GOVERNMENT': 'Government Policy',
  'SECURITY_SERVICES': 'Security and Intelligence Services',
  'TAX_ECON_PRICE': 'Economic Pricing',
  'WB_694_BROADCAST_AND_MEDIA': 'Broadcasting and Media',
  'CRISISLEX_C03_WELLBEING_HEALTH': 'Wellbeing and Health',
  'WB_2433_CONFLICT_AND_VIOLENCE': 'Conflict and Violence',
  'TAX_FNCACT_POLICE': 'Police Activities',
  'ARMEDCONFLICT': 'Armed Conflict',
  'AFFECT': 'Emotional and Social Impact',
  'WB_135_TRANSPORT': 'Transportation',
  'LEGISLATION': 'Laws and Legislation',
  'CRISISLEX_T03_DEAD': 'Fatalities and Deaths',
  'CRISISLEX_T11_UPDATESSYMPATHY': 'Updates and Sympathy',
  'WB_2670_JOBS': 'Employment and Jobs',
  'TRIAL': 'Legal Trials and Proceedings',
  'TAX_FNCACT_MINISTER': 'Ministerial Activities',
  'WB_831_GOVERNANCE': 'Governance and Administration',
  'EPU_CATS_MIGRATION_FEAR_FEAR': 'Migration and Fear',
  'WB_470_EDUCATION': 'Education Systems',
  'WB_1014_CRIMINAL_JUSTICE': 'Criminal Justice',
  'EPU_ECONOMY': 'Economic Affairs',
  'WB_832_ANTI_CORRUPTION': 'Anti-Corruption',
  'PROTEST': 'Protests and Demonstrations',
  'ECON_INFLATION': 'Economic Inflation',
  'WB_1015_POLICE': 'Police and Law Enforcement',
  'CRISISLEX_T02_INJURED': 'Injuries and Casualties',
  'CRISISLEX_C06_REGIMECHANGE': 'Regime Change',
  'WB_837_DEFENSE': 'Defense and Military',
  'CRISISLEX_T01_URGENT': 'Urgent Situations',
  'CRISISLEX_C04_INFRASTRUCTURE': 'Infrastructure',
  'CRISISLEX_C05_TERRORISM': 'Terrorism',
  'CRISISLEX_C01_DISEASE': 'Disease Outbreaks',
  'TERROR': 'Terrorism and Terror',
  'CRISISLEX_T04_EVACUATION': 'Evacuations',
  'CRISISLEX_T05_SHELTER': 'Shelter and Housing',
  'CRISISLEX_T06_POLICE': 'Police Response',
  'CRISISLEX_T07_EMERGENCY': 'Emergency Situations',
  'CRISISLEX_T08_STORM': 'Storms and Weather',
  'CRISISLEX_T09_FLOOD': 'Floods and Flooding',
  'CRISISLEX_T10_FIRE': 'Fires and Blazes',
  'ENV_CLIMATE': 'Climate and Environment',
  'WB_2671_UNEMPLOYMENT': 'Unemployment',
  'USPEC_POLICY2': 'Policy Analysis',
  'CRISISLEX_C02_SEARCH_AND_RESCUE': 'Search and Rescue',
  'ECON_STOCKMARKET': 'Stock Market',
  'NATURAL_DISASTER': 'Natural Disasters',
  'CRISISLEX_T12_THREAT': 'Threats and Warnings',
  'CRISISLEX_T13_BOMB': 'Bombs and Explosives',
  'CRISISLEX_T14_EXPLOSION': 'Explosions',
  'CRISISLEX_T15_GUNFIRE': 'Gunfire and Shooting',
  'CRISISLEX_T16_VIOLENCE': 'Violence and Aggression',
  'CRISISLEX_T17_LOOTING': 'Looting and Theft',
  'CRISISLEX_T18_ARREST': 'Arrests and Detentions',
  'CRISISLEX_T19_CASUALTY': 'Casualties and Victims',
  'CRISISLEX_T20_MISSING': 'Missing Persons',
  'CRISISLEX_T21_HOSTAGE': 'Hostages and Kidnapping',
  'CRISISLEX_T22_REFUGEE': 'Refugees and Asylum',
  'CRISISLEX_T23_DISPLACED': 'Displaced Persons',
  'CRISISLEX_T24_HOMELESS': 'Homelessness',
  'CRISISLEX_T25_HUNGER': 'Hunger and Malnutrition',
  'CRISISLEX_T26_DISEASE': 'Disease and Illness',
  'CRISISLEX_T27_EPIDEMIC': 'Epidemics',
  'CRISISLEX_T28_PANDEMIC': 'Pandemics',
  'CRISISLEX_T29_QUARANTINE': 'Quarantine and Isolation',
  'CRISISLEX_T30_CONTAMINATION': 'Contamination and Pollution',
  'ECON_CURRENCY': 'Currency and Exchange',
  'ECON_PRICECONTROLS': 'Price Controls',
  'ECON_OILPRICES': 'Oil Prices',
  'ECON_GASOLINE': 'Gasoline and Fuel',
  'ECON_ELECTRICITY': 'Electricity and Power',
  'ECON_WATER': 'Water Resources',
  'ECON_FOOD': 'Food and Agriculture',
  'ECON_HOUSING': 'Housing and Real Estate',
  'ECON_HEALTHCARE': 'Healthcare Economics',
  'ECON_EDUCATION': 'Education Economics',
  'ECON_TRANSPORTATION': 'Transportation Economics',
  'ECON_TELECOMMUNICATIONS': 'Telecommunications',
  'ECON_INTERNET': 'Internet and Technology',
  'ECON_BANKING': 'Banking and Finance',
  'ECON_INSURANCE': 'Insurance Industry',
  'ECON_TOURISM': 'Tourism Industry',
  'ECON_AGRICULTURE': 'Agriculture Industry',
  'ECON_MINING': 'Mining Industry',
  'ECON_MANUFACTURING': 'Manufacturing Industry',
  'ECON_CONSTRUCTION': 'Construction Industry',
  'ECON_TRADE': 'Trade and Commerce',
  'ECON_RETAIL': 'Retail Industry'
};

// ===== IMAGE TAG LOOKUPS =====

/**
 * Popular GDELT Image Tags (top 100 most common)
 * Based on LOOKUP-IMAGETAGS.TXT from GDELT API
 */
export type ImageTag = 
  | 'person' | 'profession' | 'vehicle' | 'sports' | 'speech' | 'people' | 'font' | 'brand'
  | 'hairstyle' | 'official' | 'hair' | 'document' | 'text' | 'player' | 'football player'
  | 'clothing' | 'art' | 'advertising' | 'hand' | 'presentation' | 'screenshot' | 'model'
  | 'nose' | 'product' | 'area' | 'food' | 'land vehicle' | 'head' | 'logo' | 'transport'
  | 'mode of transport' | 'man' | 'meal' | 'portrait' | 'diagram' | 'line' | 'photo shoot'
  | 'face' | 'facial hair' | 'community' | 'singing' | 'businessperson' | 'athlete' | 'shape'
  | 'human action' | 'automobile' | 'fashion' | 'musician' | 'singer' | 'professional'
  | 'building' | 'architecture' | 'indoor' | 'outdoor' | 'sky' | 'water' | 'tree' | 'plant'
  | 'flower' | 'animal' | 'dog' | 'cat' | 'bird' | 'horse' | 'fish' | 'bear' | 'elephant'
  | 'lion' | 'tiger' | 'zebra' | 'giraffe' | 'monkey' | 'rabbit' | 'sheep' | 'cow' | 'pig'
  | 'chicken' | 'duck' | 'goose' | 'turkey' | 'snake' | 'turtle' | 'frog' | 'butterfly'
  | 'spider' | 'bee' | 'ant' | 'fly' | 'mosquito' | 'fire' | 'smoke' | 'explosion' | 'bomb'
  | 'weapon' | 'gun' | 'rifle' | 'pistol' | 'knife' | 'sword' | 'tank' | 'helicopter'
  | 'airplane' | 'ship' | 'boat' | 'submarine' | 'train' | 'bus' | 'truck' | 'motorcycle'
  | 'bicycle' | 'safesearchviolence' | 'safesearchmedical';

/**
 * Popular GDELT Image Web Tags (top 100 most common)
 * Based on LOOKUP-IMAGEWEBTAGS.TXT from GDELT API
 */
export type ImageWebTag = 
  | 'Image' | 'News' | 'Photograph' | 'United States of America' | 'Speech' | 'Car' | 'President'
  | 'Police' | 'Football' | 'Newspaper' | 'Donald Trump' | 'Film' | 'Death' | 'Child' | 'Woman'
  | 'Sports' | 'Screenshot' | 'Stock photography' | 'Photography' | 'Actor' | 'Vehicle' | 'Brand'
  | 'Nose' | 'Fashion' | 'Hairstyle' | 'Russia' | 'Video' | 'Presentation' | 'Art' | 'Election'
  | 'YouTube' | 'Design' | 'Football player' | 'Business' | 'President of the United States'
  | 'Politics' | 'Music' | 'Transport' | 'Money' | 'Font' | 'Hair' | 'Minister' | 'Community'
  | 'Illustration' | 'Player' | 'Health' | 'Man' | 'Germany' | 'Europe' | 'Protest' | 'China'
  | 'Government' | 'Military' | 'War' | 'Weapon' | 'Soldier' | 'Tank' | 'Fighter aircraft'
  | 'Missile' | 'Bomb' | 'Explosion' | 'Fire' | 'Smoke' | 'Disaster' | 'Flood' | 'Earthquake'
  | 'Hurricane' | 'Tornado' | 'Storm' | 'Snow' | 'Ice' | 'Rain' | 'Sun' | 'Moon' | 'Star'
  | 'Planet' | 'Space' | 'Satellite' | 'Rocket' | 'Astronaut' | 'Science' | 'Technology'
  | 'Computer' | 'Internet' | 'Smartphone' | 'Tablet' | 'Television' | 'Radio'
  | 'Book' | 'Magazine' | 'Letter' | 'Email' | 'Social media' | 'Facebook' | 'Twitter'
  | 'Instagram' | 'LinkedIn' | 'TikTok' | 'Snapchat' | 'WhatsApp' | 'Telegram' | 'Signal'
  | 'Zoom' | 'Skype' | 'Google' | 'Apple' | 'Microsoft' | 'Amazon' | 'Netflix' | 'Tesla'
  | 'Bitcoin' | 'Cryptocurrency' | 'Stock market' | 'Economy' | 'Trade' | 'Industry';

// ===== THEME AND TAG HELPER FUNCTIONS =====

/**
 * Search themes by keyword (case-insensitive)
 */
export function searchThemes(keyword: string): GKGTheme[] {
  const searchTerm = keyword.toLowerCase();
  
  // Include both the original search term and any abbreviation expansions
  const searchTerms = [searchTerm, ...(THEME_ABBREVIATIONS[searchTerm] ?? [])];
  
  return (Object.keys(ThemeDescriptions) as GKGTheme[])
    .filter(theme => 
      searchTerms.some(term => 
        theme.toLowerCase().includes(term) || 
        ThemeDescriptions[theme]?.toLowerCase().includes(term)
      )
    )
    .slice(0, 10); // Limit to 10 results
}

/**
 * Get theme description
 */
export function getThemeDescription(theme: GKGTheme): string {
  return ThemeDescriptions[theme] ?? theme;
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: string): GKGTheme[] {
  const searchTerm = category.toLowerCase();
  return (Object.keys(ThemeDescriptions) as GKGTheme[])
    .filter(theme => 
      theme.toLowerCase().includes(searchTerm) || 
      ThemeDescriptions[theme]?.toLowerCase().includes(searchTerm)
    )
    .slice(0, 20); // Limit to 20 results
}

/**
 * Check if a value is a valid theme
 */
export function isValidTheme(value: string): boolean {
  return value.toUpperCase() in ThemeDescriptions;
}

/**
 * Search image tags by keyword (case-insensitive)
 */
export function searchImageTags(keyword: string): ImageTag[] {
  const searchTerm = keyword.toLowerCase();
  const allTags: ImageTag[] = [
    'person', 'profession', 'vehicle', 'sports', 'speech', 'people', 'font', 'brand',
    'hairstyle', 'official', 'hair', 'document', 'text', 'player', 'football player',
    'clothing', 'art', 'advertising', 'hand', 'presentation', 'screenshot', 'model',
    'nose', 'product', 'area', 'food', 'land vehicle', 'head', 'logo', 'transport',
    'mode of transport', 'man', 'meal', 'portrait', 'diagram', 'line', 'photo shoot',
    'face', 'facial hair', 'community', 'singing', 'businessperson', 'athlete', 'shape',
    'human action', 'automobile', 'fashion', 'musician', 'singer', 'professional',
    'building', 'architecture', 'indoor', 'outdoor', 'sky', 'water', 'tree', 'plant',
    'flower', 'animal', 'dog', 'cat', 'bird', 'horse', 'fish', 'bear', 'elephant',
    'lion', 'tiger', 'zebra', 'giraffe', 'monkey', 'rabbit', 'sheep', 'cow', 'pig',
    'chicken', 'duck', 'goose', 'turkey', 'snake', 'turtle', 'frog', 'butterfly',
    'spider', 'bee', 'ant', 'fly', 'mosquito', 'fire', 'smoke', 'explosion', 'bomb',
    'weapon', 'gun', 'rifle', 'pistol', 'knife', 'sword', 'tank', 'helicopter',
    'airplane', 'ship', 'boat', 'submarine', 'train', 'bus', 'truck', 'motorcycle',
    'bicycle', 'safesearchviolence', 'safesearchmedical'
  ];
  
  return allTags
    .filter(tag => tag.toLowerCase().includes(searchTerm))
    .slice(0, 10); // Limit to 10 results
}

/**
 * Search image web tags by keyword (case-insensitive)
 */
export function searchImageWebTags(keyword: string): ImageWebTag[] {
  const searchTerm = keyword.toLowerCase();
  const allTags: ImageWebTag[] = [
    'Image', 'News', 'Photograph', 'United States of America', 'Speech', 'Car', 'President',
    'Police', 'Football', 'Newspaper', 'Donald Trump', 'Film', 'Death', 'Child', 'Woman',
    'Sports', 'Screenshot', 'Stock photography', 'Photography', 'Actor', 'Vehicle', 'Brand',
    'Nose', 'Fashion', 'Hairstyle', 'Russia', 'Video', 'Presentation', 'Art', 'Election',
    'YouTube', 'Design', 'Football player', 'Business', 'President of the United States',
    'Politics', 'Music', 'Transport', 'Money', 'Font', 'Hair', 'Minister', 'Community',
    'Illustration', 'Player', 'Health', 'Man', 'Germany', 'Europe', 'Protest', 'China',
    'Government', 'Military', 'War', 'Weapon', 'Soldier', 'Tank', 'Fighter aircraft',
    'Missile', 'Bomb', 'Explosion', 'Fire', 'Smoke', 'Disaster', 'Flood', 'Earthquake',
    'Hurricane', 'Tornado', 'Storm', 'Snow', 'Ice', 'Rain', 'Sun', 'Moon', 'Star',
    'Planet', 'Space', 'Satellite', 'Rocket', 'Astronaut', 'Science', 'Technology',
    'Computer', 'Internet', 'Smartphone', 'Tablet', 'Television', 'Radio', 'Newspaper',
    'Book', 'Magazine', 'Letter', 'Email', 'Social media', 'Facebook', 'Twitter',
    'Instagram', 'LinkedIn', 'TikTok', 'Snapchat', 'WhatsApp', 'Telegram', 'Signal',
    'Zoom', 'Skype', 'Google', 'Apple', 'Microsoft', 'Amazon', 'Netflix', 'Tesla',
    'Bitcoin', 'Cryptocurrency', 'Stock market', 'Economy', 'Trade', 'Industry'
  ];
  
  return allTags
    .filter(tag => tag.toLowerCase().includes(searchTerm))
    .slice(0, 10); // Limit to 10 results
}

/**
 * Get popular tags for a specific category
 */
export function getPopularTags(category: 'people' | 'animals' | 'objects' | 'places' | 'actions'): ImageTag[] {
  const categories: Record<string, ImageTag[]> = {
    people: ['person', 'people', 'man', 'official', 'player', 'businessperson', 'athlete', 'musician', 'singer', 'professional'],
    animals: ['animal', 'dog', 'cat', 'bird', 'horse', 'fish', 'bear', 'elephant', 'lion', 'tiger'],
    objects: ['vehicle', 'automobile', 'building', 'product', 'food', 'weapon', 'gun', 'airplane', 'ship', 'train'],
    places: ['building', 'architecture', 'indoor', 'outdoor', 'area', 'sky', 'water', 'tree', 'plant', 'flower'],
    actions: ['sports', 'speech', 'presentation', 'singing', 'human action', 'photo shoot', 'fashion', 'art', 'advertising']
  };
  
  return categories[category] ?? [];
}

/**
 * Check if a value is a valid image tag
 */
export function isValidImageTag(value: string): boolean {
  const allTags = [
    'person', 'profession', 'vehicle', 'sports', 'speech', 'people', 'font', 'brand',
    'hairstyle', 'official', 'hair', 'document', 'text', 'player', 'football player',
    'clothing', 'art', 'advertising', 'hand', 'presentation', 'screenshot', 'model',
    'nose', 'product', 'area', 'food', 'land vehicle', 'head', 'logo', 'transport',
    'mode of transport', 'man', 'meal', 'portrait', 'diagram', 'line', 'photo shoot',
    'face', 'facial hair', 'community', 'singing', 'businessperson', 'athlete', 'shape',
    'human action', 'automobile', 'fashion', 'musician', 'singer', 'professional',
    'building', 'architecture', 'indoor', 'outdoor', 'sky', 'water', 'tree', 'plant',
    'flower', 'animal', 'dog', 'cat', 'bird', 'horse', 'fish', 'bear', 'elephant',
    'lion', 'tiger', 'zebra', 'giraffe', 'monkey', 'rabbit', 'sheep', 'cow', 'pig',
    'chicken', 'duck', 'goose', 'turkey', 'snake', 'turtle', 'frog', 'butterfly',
    'spider', 'bee', 'ant', 'fly', 'mosquito', 'fire', 'smoke', 'explosion', 'bomb',
    'weapon', 'gun', 'rifle', 'pistol', 'knife', 'sword', 'tank', 'helicopter',
    'airplane', 'ship', 'boat', 'submarine', 'train', 'bus', 'truck', 'motorcycle',
    'bicycle', 'safesearchviolence', 'safesearchmedical'
  ];
  
  return allTags.includes(value.toLowerCase() as ImageTag);
}

/**
 * Check if a value is a valid image web tag
 */
export function isValidImageWebTag(value: string): boolean {
  const allTags = [
    'Image', 'News', 'Photograph', 'United States of America', 'Speech', 'Car', 'President',
    'Police', 'Football', 'Newspaper', 'Donald Trump', 'Film', 'Death', 'Child', 'Woman',
    'Sports', 'Screenshot', 'Stock photography', 'Photography', 'Actor', 'Vehicle', 'Brand',
    'Nose', 'Fashion', 'Hairstyle', 'Russia', 'Video', 'Presentation', 'Art', 'Election',
    'YouTube', 'Design', 'Football player', 'Business', 'President of the United States',
    'Politics', 'Music', 'Transport', 'Money', 'Font', 'Hair', 'Minister', 'Community',
    'Illustration', 'Player', 'Health', 'Man', 'Germany', 'Europe', 'Protest', 'China',
    'Government', 'Military', 'War', 'Weapon', 'Soldier', 'Tank', 'Fighter aircraft',
    'Missile', 'Bomb', 'Explosion', 'Fire', 'Smoke', 'Disaster', 'Flood', 'Earthquake',
    'Hurricane', 'Tornado', 'Storm', 'Snow', 'Ice', 'Rain', 'Sun', 'Moon', 'Star',
    'Planet', 'Space', 'Satellite', 'Rocket', 'Astronaut', 'Science', 'Technology',
    'Computer', 'Internet', 'Smartphone', 'Tablet', 'Television', 'Radio', 'Newspaper',
    'Book', 'Magazine', 'Letter', 'Email', 'Social media', 'Facebook', 'Twitter',
    'Instagram', 'LinkedIn', 'TikTok', 'Snapchat', 'WhatsApp', 'Telegram', 'Signal',
    'Zoom', 'Skype', 'Google', 'Apple', 'Microsoft', 'Amazon', 'Netflix', 'Tesla',
    'Bitcoin', 'Cryptocurrency', 'Stock market', 'Economy', 'Trade', 'Industry'
  ];
  
  return allTags.includes(value as ImageWebTag);
}