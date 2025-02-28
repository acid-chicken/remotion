import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Miriam Libre',
	importName: 'MiriamLibre',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Miriam+Libre:ital,wght@0,400;0,700',
	unicodeRanges: {
		hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				hebrew:
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdTh798HsHwubBAqfkcBTL_fZZP-fes.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdTh798HsHwubBAqfkcBTL_faZP-fes.woff2',
				latin:
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdTh798HsHwubBAqfkcBTL_fZ5P-.woff2',
			},
			'700': {
				hebrew:
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdT-798HsHwubBAqfkcBTL_X3LbrQMq6z-Y.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdT-798HsHwubBAqfkcBTL_X3LbrTMq6z-Y.woff2',
				latin:
					'https://fonts.gstatic.com/s/miriamlibre/v14/DdT-798HsHwubBAqfkcBTL_X3LbrQsq6.woff2',
			},
		},
	},
});

export const fontFamily = 'Miriam Libre' as const;

type Variants = {
	normal: {
		weights: '400' | '700';
		subsets: 'hebrew' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
