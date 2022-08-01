import { parse } from 'cookie';
import { isTheme, type Theme } from '$lib/types';

export function getThemeFromCookies(cookieString: string): Theme {
	const cookies = parse(cookieString || '');
	const theme = cookies.theme;
	return isTheme(theme) ? theme : 'light';
}
