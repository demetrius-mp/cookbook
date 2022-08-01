export type Kind = 'info' | 'success' | 'warning' | 'error';

export type ToastPromise = {
	message: string;
	resolve: () => Promise<void>;
};

export type Toast = {
	id: string;
	kind: Kind;
	message: string;
	removeAfter: number | 'never';
	promise?: ToastPromise;
};

export type ToastCreateInput = Omit<Toast, 'id'>;
