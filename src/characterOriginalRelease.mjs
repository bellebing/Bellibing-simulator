// Read-only projection of original playable release order by canonical Character ID.
// Never derive these dates from reruns, checkedAt, database insertion, or catalog order.
// Sources: official Kuro version/convene notices (summarized in the independent
// https://senseos.gg/wiki/wuthering-waves/versions/?view=all timeline),
// https://gachaflex.com/wuwa/banners (debut banner start dates), and
// https://wutheringwaves.party/en/resonators/ (launch, standard and Rover forms).
// 3.4 Lucilla first banner (13 Jun): https://senseos.gg/wiki/wuthering-waves/resonators/lucilla/
// 3.7 official: https://wutheringwaves.kurogames.com/en/main/news/detail/5571
// 3.8 official patch notes (Lily): https://wutheringwaves.gg/patch-notes-for-version-3-8-lilies-in-a-dying-dream/
// These are first playable/debut dates, not the first day of every rerun. Same-day
// debut/launch ties are resolved by canonical ID; no claimed intraday ordering.
// Upcoming/unimported identities have NO effect on the selectable catalog.
// Future releases: add one source-reviewed row here, not a new UI sorting branch.
const ORIGINAL_RELEASE_ROWS = [
  [
    "aalto",
    "1.0",
    "2024-05-23"
  ],
  [
    "baizhi",
    "1.0",
    "2024-05-23"
  ],
  [
    "calcharo",
    "1.0",
    "2024-05-23"
  ],
  [
    "chixia",
    "1.0",
    "2024-05-23"
  ],
  [
    "danjin",
    "1.0",
    "2024-05-23"
  ],
  [
    "encore",
    "1.0",
    "2024-05-23"
  ],
  [
    "jianxin",
    "1.0",
    "2024-05-23"
  ],
  [
    "jiyan",
    "1.0",
    "2024-05-23"
  ],
  [
    "lingyang",
    "1.0",
    "2024-05-23"
  ],
  [
    "mortefi",
    "1.0",
    "2024-05-23"
  ],
  [
    "rover-havoc",
    "1.0",
    "2024-05-23"
  ],
  [
    "rover-spectro",
    "1.0",
    "2024-05-23"
  ],
  [
    "sanhua",
    "1.0",
    "2024-05-23"
  ],
  [
    "taoqi",
    "1.0",
    "2024-05-23"
  ],
  [
    "verina",
    "1.0",
    "2024-05-23"
  ],
  [
    "yangyang",
    "1.0",
    "2024-05-23"
  ],
  [
    "yinlin",
    "1.0",
    "2024-06-06"
  ],
  [
    "yuanwu",
    "1.0",
    "2024-05-23"
  ],
  [
    "jinhsi",
    "1.1",
    "2024-06-28"
  ],
  [
    "changli",
    "1.1",
    "2024-07-22"
  ],
  [
    "zhezhi",
    "1.2",
    "2024-08-15"
  ],
  [
    "xiangli-yao",
    "1.2",
    "2024-09-07"
  ],
  [
    "the-shorekeeper",
    "1.3",
    "2024-09-29"
  ],
  [
    "youhu",
    "1.3",
    "2024-10-24"
  ],
  [
    "camellya",
    "1.4",
    "2024-11-14"
  ],
  [
    "lumi",
    "1.4",
    "2024-12-12"
  ],
  [
    "carlotta",
    "2.0",
    "2025-01-02"
  ],
  [
    "roccia",
    "2.0",
    "2025-01-23"
  ],
  [
    "phoebe",
    "2.1",
    "2025-02-13"
  ],
  [
    "brant",
    "2.1",
    "2025-03-06"
  ],
  [
    "cantarella",
    "2.2",
    "2025-03-27"
  ],
  [
    "rover-aero",
    "2.2",
    "2025-03-27"
  ],
  [
    "zani",
    "2.3",
    "2025-04-29"
  ],
  [
    "ciaccona",
    "2.3",
    "2025-05-22"
  ],
  [
    "cartethyia",
    "2.4",
    "2025-06-12"
  ],
  [
    "lupa",
    "2.4",
    "2025-07-03"
  ],
  [
    "phrolova",
    "2.5",
    "2025-07-24"
  ],
  [
    "augusta",
    "2.6",
    "2025-08-28"
  ],
  [
    "iuno",
    "2.6",
    "2025-09-17"
  ],
  [
    "galbrena",
    "2.7",
    "2025-10-09"
  ],
  [
    "qiuyuan",
    "2.7",
    "2025-10-30"
  ],
  [
    "chisa",
    "2.8",
    "2025-11-20"
  ],
  [
    "buling",
    "2.8",
    "2025-12-11"
  ],
  [
    "lynae",
    "3.0",
    "2025-12-25"
  ],
  [
    "mornye",
    "3.0",
    "2026-01-15"
  ],
  [
    "aemeath",
    "3.1",
    "2026-02-05"
  ],
  [
    "luuk-herssen",
    "3.1",
    "2026-02-26"
  ],
  [
    "sigrika",
    "3.2",
    "2026-03-19"
  ],
  [
    "hiyuki",
    "3.3",
    "2026-04-30"
  ],
  [
    "denia",
    "3.3",
    "2026-05-21"
  ],
  [
    "lucy",
    "3.4",
    "2026-06-08"
  ],
  [
    "rebecca",
    "3.4",
    "2026-06-08"
  ],
  [
    "lucilla",
    "3.4",
    "2026-06-13"
  ],
  [
    "yangyang-xuanling",
    "3.5",
    "2026-07-10"
  ],
  [
    "rover-electro",
    "3.5",
    "2026-07-10"
  ],
  [
    "suisui",
    "3.5",
    "2026-07-30"
  ],
  [
    "qingxiao",
    "3.6",
    "2026-08-20"
  ],
  [
    "jingran",
    "3.6",
    "2026-09-10"
  ],
  [
    "hsin",
    "3.7",
    "2026-09-30"
  ],
  [
    "suoming",
    "3.7",
    "2026-10-22"
  ],
  [
    "lily",
    "3.8",
    "2026-11-12"
  ]
];

export const CHARACTER_ORIGINAL_RELEASE = Object.freeze(Object.fromEntries(
  ORIGINAL_RELEASE_ROWS.map(([id,patch,date])=>[id,Object.freeze({patch,date})])
));

const versionNumber = patch => /^\\d+\\.\\d+$/.test(patch) ? patch.split('.').reduce((a,n)=>a*100+Number(n),0) : null;

/** Pure, non-mutating 5★ → 4★; newest FIRST debut within each rarity.
 * Missing release metadata is not a guessed date: it sorts below sourced entries
 * of the same rarity. In a shared patch, dated entries precede undated entries;
 * if both share a known day (or neither has a date), canonical ID asc breaks ties.
 * This projection is independent of UI filters and AccountStore state.
 */
export function compareCharactersByOriginalRelease(a,b){
  const rarity=Number(b.rarity===5?5:b.rarity===4?4:0)-Number(a.rarity===5?5:a.rarity===4?4:0);
  if(rarity)return rarity;
  const ar=CHARACTER_ORIGINAL_RELEASE[a.id],br=CHARACTER_ORIGINAL_RELEASE[b.id];
  if(!ar||!br){if(!ar&&br)return 1;if(ar&&!br)return -1;}
  if(ar&&br){
    const patch=(versionNumber(br.patch)??-1)-(versionNumber(ar.patch)??-1);
    if(patch)return patch;
    if(ar.date!==br.date){
      if(!ar.date)return 1;
      if(!br.date)return -1;
      return br.date.localeCompare(ar.date);
    }
  }
  return String(a.id).localeCompare(String(b.id),'en');
}

export const sortCharactersByOriginalRelease = rows => [...rows].sort(compareCharactersByOriginalRelease);
