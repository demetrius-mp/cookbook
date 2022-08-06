/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_JWT_SECRET_KEY: string;
	readonly JWT_EXPIRES_IN: string;
	readonly JWT_ALGORITHM: import('jsonwebtoken').Algorithm;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
