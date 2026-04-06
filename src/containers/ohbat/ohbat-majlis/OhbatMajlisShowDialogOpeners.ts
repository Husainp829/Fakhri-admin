/**
 * Bridges inline edit icons (details tab) to dialog open handlers living in the show toolbar.
 * Show renders actions and card content as siblings, so a single React context cannot wrap both.
 */
const openers: { sadarat: (() => void) | null; khidmat: (() => void) | null } = {
  sadarat: null,
  khidmat: null,
};

export function registerOhbatMajlisShowDialogOpeners(handlers: {
  openSadarat: () => void;
  openKhidmat: () => void;
}): void {
  openers.sadarat = handlers.openSadarat;
  openers.khidmat = handlers.openKhidmat;
}

export function unregisterOhbatMajlisShowDialogOpeners(): void {
  openers.sadarat = null;
  openers.khidmat = null;
}

export function openOhbatMajlisSadaratDialog(): void {
  openers.sadarat?.();
}

export function openOhbatMajlisKhidmatDialog(): void {
  openers.khidmat?.();
}
