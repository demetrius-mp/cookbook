import { parse } from 'cookie';

export const themes = ['light', 'dark'] as const;
export type Theme = typeof themes[number];

export const isTheme = (theme: unknown): theme is Theme =>
	typeof theme === 'string' && themes.includes(theme as Theme);

export function getThemeFromCookies(cookieString: string): Theme {
	const cookies = parse(cookieString || '');
	const theme = cookies.theme;
	return isTheme(theme) ? theme : 'light';
}
