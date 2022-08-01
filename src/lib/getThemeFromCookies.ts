import { parse } from 'cookie';
import { isTheme, type Theme } from '$lib/types';

export function getThemeFromCookies(cookiesString: string): Theme {
	const cookies = parse(cookiesString || '');
	const theme = cookies.theme;
	return isTheme(theme) ? theme : 'light';
}
