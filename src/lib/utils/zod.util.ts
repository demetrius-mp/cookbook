import { mapValues } from 'lodash-es';

export type MappedZodError<T> = {
	[Property in keyof T]: {
		_errors: string[];
	};
};

export function makeMappedZodErrors<T extends object>(obj: T): MappedZodError<T> {
	const errors: MappedZodError<T> = mapValues(obj, () => {
		return {
			_errors: []
		};
	});

	return errors;
}
