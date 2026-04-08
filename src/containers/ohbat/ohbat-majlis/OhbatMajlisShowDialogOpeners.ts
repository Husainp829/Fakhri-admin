/**
 * Bridges inline edit icons (details tab) to dialog open handlers living in the show toolbar.
 * Show renders actions and card content as siblings, so a single React context cannot wrap both.
 */
const openers: {
  sadarat: (() => void) | null;
  khidmat: (() => void) | null;
  zakereen: (() => void) | null;
} = {
  sadarat: null,
  khidmat: null,
  zakereen: null,
};

export function registerOhbatMajlisShowDialogOpeners(handlers: {
  openSadarat: () => void;
  openKhidmat: () => void;
  openZakereen: () => void;
}): void {
  openers.sadarat = handlers.openSadarat;
  openers.khidmat = handlers.openKhidmat;
  openers.zakereen = handlers.openZakereen;
}

export function unregisterOhbatMajlisShowDialogOpeners(): void {
  openers.sadarat = null;
  openers.khidmat = null;
  openers.zakereen = null;
}

export function openOhbatMajlisSadaratDialog(): void {
  openers.sadarat?.();
}

export function openOhbatMajlisKhidmatDialog(): void {
  openers.khidmat?.();
}

export function openOhbatMajlisZakereenDialog(): void {
  openers.zakereen?.();
}
