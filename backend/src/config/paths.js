import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SRC_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const BACKEND_DIR = path.dirname(SRC_DIR);
export const REPO_DIR = path.dirname(BACKEND_DIR);
export const UPLOADS_DIR = path.join(BACKEND_DIR, 'uploads');
