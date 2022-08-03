import { parse } from 'cookie';

export const themes = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter'
] as const;

export type Theme = typeof themes[number];

export const isTheme = (theme: unknown): theme is Theme =>
	typeof theme === 'string' && themes.includes(theme as Theme);

export function getThemeFromCookies(cookieString: string): Theme {
	const cookies = parse(cookieString || '');
	const theme = cookies.theme;
	return isTheme(theme) ? theme : 'light';
}
