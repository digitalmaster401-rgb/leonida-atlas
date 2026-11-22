import rawCheats from '../../content/cheats.json';
import rawConsole from '../../content/console.json';
import rawLoadout from '../../content/loadout.json';
import type { CheatsFile, ConsoleFile, LoadoutFile } from './schema-fase2';

// Validados con Zod en tests/fase2.test.ts (dentro de npm run validate:data); aquí se usan tal cual.
export const cheatsData = rawCheats as CheatsFile;
export const consoleData = rawConsole as ConsoleFile;
export const loadoutData = rawLoadout as LoadoutFile;
