// Generated from manually reviewed original release passive rows.
import type { WeaponEffectData } from '../effectDomain.ts';
export const SIGNATURE_RELEASE_WEAPON_EFFECTS: readonly WeaponEffectData[] = [
  {
    "effectId": "thousandfold-deliverance-all-attribute",
    "weaponId": "thousandfold-deliverance",
    "statOrEffect": "All Attribute DMG",
    "rankValues": [
      0.12,
      0.15,
      0.18,
      0.21,
      0.24
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "PERMANENT",
    "trigger": "Passive",
    "durationSeconds": null,
    "triggerCooldownSeconds": null,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [],
    "simulatorMode": "ALWAYS",
    "mechanicsStatus": "VERIFIED_MODELED",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s.",
    "notes": "Explicit unconditional self All-Attribute DMG; the existing static Build-stat contract applies.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21010076; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "thousandfold-deliverance-nature-crit-damage",
    "weaponId": "thousandfold-deliverance",
    "statOrEffect": "CRIT DMG",
    "rankValues": [
      0.04,
      0.05,
      0.06,
      0.07,
      0.08
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "STACKING",
    "trigger": "Casting Intro Skill or gaining a Shield as the active Resonator grants a Nature's Order stack.",
    "durationSeconds": 7,
    "triggerCooldownSeconds": null,
    "maxStacks": 6,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s.",
    "notes": "Values are per stack; source maximum is six stacks (24/30/36/42/48%). Shield-trigger cadence is 0.5s; this is not generalized to the Intro trigger. Switching immediately removes Nature's Order.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21010076; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "thousandfold-deliverance-nature-heavy-crit-rate",
    "weaponId": "thousandfold-deliverance",
    "statOrEffect": "Heavy Attack CRIT Rate",
    "rankValues": [
      0.12,
      0.15,
      0.18,
      0.21,
      0.24
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "STATE_CONDITIONAL",
    "trigger": "Nature's Order reaches six stacks.",
    "durationSeconds": null,
    "triggerCooldownSeconds": null,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s.",
    "notes": "Heavy Attack CRIT Rate only. Depends on Nature's Order state and is not a permanent whole-Character CRIT stat.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21010076; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "thousandfold-deliverance-cradle-heavy-def-ignore",
    "weaponId": "thousandfold-deliverance",
    "statOrEffect": "Heavy Attack DEF Ignore",
    "rankValues": [
      0.15,
      0.175,
      0.2,
      0.225,
      0.25
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "STACKING",
    "trigger": "Heavy Attack consumes up to two Cradle of Life stacks.",
    "durationSeconds": 2,
    "triggerCooldownSeconds": null,
    "maxStacks": 2,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. Casting Intro Skill or gaining a Shield as the active Resonator grants 1 stack of Nature's Order and 1 stack of Cradle of Life. This effect can be triggered via gaining a Shield once every 0.5s, stacking up to 6 times, lasting for 7s. Switching to another Resonator ends both Nature's Order and Cradle of Life immediately.\nNature's Order: Crit. DMG is increased by 4%, up to 24%. When Nature's Order reaches 6 stacks, the Crit. Rate of Heavy Attack DMG is increased by 12%.\nCradle of Life: Casting Heavy Attack consumes up to 2 stacks of Cradle of Life. For every 1 stacks of Cradle of Life consumed, Heavy Attack DMG ignores 15% of the target's DEF, up to 30%. The effect lasts for 2s.",
    "notes": "Values are per consumed stack; original maximum is 30/35/40/45/50%. Cradle gains one stack alongside Nature's Order, up to six held stacks for seven seconds, with 0.5s Shield-trigger cadence and immediate removal on switch. Consumed damage stacks and held resource stacks are distinct; execution stays unmodeled.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21010076; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "blooming-jadehaven-all-attribute",
    "weaponId": "blooming-jadehaven",
    "statOrEffect": "All Attribute DMG",
    "rankValues": [
      0.12,
      0.15,
      0.18,
      0.21,
      0.24
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "PERMANENT",
    "trigger": "Passive",
    "durationSeconds": null,
    "triggerCooldownSeconds": null,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [],
    "simulatorMode": "ALWAYS",
    "mechanicsStatus": "VERIFIED_MODELED",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies.",
    "notes": "Explicit unconditional self All-Attribute DMG; the existing static Build-stat contract applies.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21050116; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "blooming-jadehaven-skill-amplification",
    "weaponId": "blooming-jadehaven",
    "statOrEffect": "Resonance Skill DMG Amplification",
    "rankValues": [
      0.36,
      0.45,
      0.54,
      0.63,
      0.72
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "STATE_CONDITIONAL",
    "trigger": "After the wielder inflicts Electro Flare or triggers Unison Response.",
    "durationSeconds": null,
    "triggerCooldownSeconds": null,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies.",
    "notes": "Source values only. No independent timing, full-stack state, uptime, stack mutation or team applicability is inferred.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21050116; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "blooming-jadehaven-electro-res-ignore",
    "weaponId": "blooming-jadehaven",
    "statOrEffect": "Electro RES Ignore",
    "rankValues": [
      0.1,
      0.135,
      0.17,
      0.205,
      0.24
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "STATE_CONDITIONAL",
    "trigger": "After the wielder inflicts Electro Flare or triggers Unison Response.",
    "durationSeconds": null,
    "triggerCooldownSeconds": null,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "SELF",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies.",
    "notes": "Applies to Resonance Skill damage only; not generic resistance reduction or a team aura.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21050116; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  },
  {
    "effectId": "blooming-jadehaven-flare-amplification",
    "weaponId": "blooming-jadehaven",
    "statOrEffect": "Electro Flare DMG Taken Amplification",
    "rankValues": [
      0.3,
      0.375,
      0.45,
      0.525,
      0.6
    ],
    "valueUnit": "DECIMAL_MULTIPLIER",
    "effectType": "TRIGGERED",
    "trigger": "While the wielder is the active Resonator; targets within source-specified range.",
    "durationSeconds": 30,
    "triggerCooldownSeconds": 0.1,
    "maxStacks": 1,
    "stackIntervalSeconds": 0,
    "appliesTo": "TARGET",
    "conditions": [
      "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies."
    ],
    "simulatorMode": "MANUAL",
    "mechanicsStatus": "VERIFIED_RAW_PENDING_MODEL",
    "sourceEffectText": "Grants 12% All-Attribute DMG Bonus. After the wielder inflicts Electro Flare or triggers Unison Response, Resonance Skill DMG is Amplified by 36% and ignores 10% of the target's Electro RES. While the wielder is the active Resonator, Electro Flare DMG taken by targets within a certain range is Amplified by 30% for 30s, triggered 1 times every 0.1s. Only the strongest effect of the same name applies.",
    "notes": "One trigger every 0.1s; only the strongest same-name effect applies. Range magnitude and refresh/event ordering are not supplied by the source and remain unmodeled.",
    "provenance": {
      "sourceLabels": [
        "Original released 3.7 weapon passive and R1–R5 parameter arrays"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/weapon/weaponconf.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/property/weaponpropertygrowth.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Original weapon 21050116; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json."
      ]
    }
  }
] as const;
