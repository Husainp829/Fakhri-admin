/**
 * Bridges inline edit icons (details tab) to dialog open handlers living in the show toolbar.
 * Show renders actions and card content as siblings, so a single React context cannot wrap both.
 */
const openers = {
  sadarat: null,
  khidmat: null,
};

export function registerOhbatMajlisShowDialogOpeners(handlers) {
  openers.sadarat = handlers.openSadarat;
  openers.khidmat = handlers.openKhidmat;
}

export function unregisterOhbatMajlisShowDialogOpeners() {
  openers.sadarat = null;
  openers.khidmat = null;
}

export function openOhbatMajlisSadaratDialog() {
  openers.sadarat?.();
}

export function openOhbatMajlisKhidmatDialog() {
  openers.khidmat?.();
}
