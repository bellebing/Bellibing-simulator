// Presentation projections only; account ownership stays in the parent application.
export const source = parent !== window ? parent.bellibingWorkshopSource : null;
if (!source) throw new Error('Open Echo Workshop from the Bellibing application.');
const deadline = Date.now() + 30000;
while (!source.ready()) {
  if (Date.now() > deadline) throw new Error('Canonical application data could not be loaded.');
  await new Promise(resolve => setTimeout(resolve, 50));
}
export const ACCOUNT_IDS = source.characters().filter(row => row.onAccount).map(row => row.id);
export const FEATURED_IDS = ACCOUNT_IDS;
export const STAT_LABELS = ['HP','ATK','DEF','Energy Regen','CRIT Rate','CRIT DMG','Element DMG Bonus','Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG','Healing Bonus'];
export function previewSnapshot(id) {
  const saved = source.snapshot(id);
  return { onAccount:saved.onAccount, hasBuild:saved.onAccount, slots:saved.slots.filter(Boolean).length,
    weapon:saved.weapon, stats:[saved.stats[1],saved.stats[4],saved.stats[5]] };
}
