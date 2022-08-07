export type Kind = 'info' | 'success' | 'warning' | 'error' | 'loading';

export type Toast = {
	id: string;
	kind: Kind;
	message: string;
	removeAfter: number | 'never';
};

export type ToastCreateInput = Omit<Toast, 'id'>;
