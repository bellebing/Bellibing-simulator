// Generated from reviewed original release source; regenerate with scripts/generate-release-character-kit-facts.mjs.
import type { CharacterMechanicFact, CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';

export const RELEASE_CHARACTER_KIT_FACTS: readonly CharacterMechanicFact[] = [
  {
    "factId": "hsin-skill-1006101-rules",
    "characterId": "hsin",
    "name": "Manifold Bloom",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006101; exact prerequisites are in effectSummary.",
    "effectSummary": "Basic Attack - Answering Form\nWhile in Answering Form, perform up to 4 consecutive attacks, dealing Electro DMG.\n\nHeavy Attack - Answering Form\nWhile in Answering Form, consume STA to deal Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 2.\n\nMid-air Attack - Answering Form\nWhile in Answering Form and in mid-air, press Normal Attack to perform a Plunging Attack at the cost of STA, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 2.\n\nHeavy Attack - Answering Form: Reign at Ease\nWhile in Answering Form and in mid-air, hold Normal Attack to cast Heavy Attack - Answering Form: Reign at Ease, continuously consuming STA and dealing Electro DMG to the target.\nDepleting all STA or switching to another Resonator ends the skill action early.\n\nMid-air Attack - Answering Form: Reign at Ease\nWhen the Normal Attack button is released during Heavy Attack - Answering Form: Reign at Ease, Hsin casts Mid-air Attack - Answering Form: Reign at Ease, consuming STA to perform a Plunging Attack, transforming into the Moon Fox upon landing and dealing Electro DMG.\nAfter casting Mid-air Attack - Answering Form: Reign at Ease, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 2.\n\nDodge Counter - Answering Form\nWhile in Answering Form, press Normal Attack within a short time after a successful Dodge to attack the target, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 3.\n\nBasic Attack - Illumining Form\nWhile in Illumining Form and not in the Mechanism Dominion state, command Xuanfang Mechanisms to perform up to 3 consecutive attacks, dealing Electro DMG.\nCasting Basic Attack - Illumining Form Stage 1 generates a Modular Heartlock at the target's position. Casting Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form causes the Modular Heartlock to collapse, dealing Electro DMG.\nCasting this skill consumes STA when Hsin is in mid-air.\n\nHeavy Attack - Illumining Form\nWhile in Illumining Form, consume STA to command Xuanfang Mechanisms, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Illumining Form Stage 3.\n\nUpward Cut - Illumining Form\nWhile in Illumining Form and on the ground, press Jump to cast this skill, dealing Electro DMG.\n\nMid-air Attack - Illumining Form\nWhile in Illumining Form and Hsin is in mid-air, Resonance Skill - Illumining Form is replaced with Mid-air Attack - Illumining Form.\nConsume STA to perform a Plunging Attack, dealing Electro DMG.\n\nDodge Counter - Illumining Form\nWhile in Illumining Form, press Normal Attack within a short time after a successful Dodge to attack the target, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Illumining Form Stage 3.\n\nBasic Attack - Illumining Form: Pillars Aligned\nWhile in Illumining Form and in the Mechanism Dominion state, command Xuanfang Mechanisms to perform up to 4 consecutive attacks, dealing Electro DMG.\n\nDodge Counter - Illumining Form: Pillars Aligned\nWhile in Illumining Form and in the Mechanism Dominion state, press Normal Attack within a short time after a successful Dodge to attack the target, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Illumining Form: Pillars Aligned Stage 3.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-damage-1311101",
    "characterId": "hsin",
    "name": "Basic Attack - Answering Form Stage 1 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311101; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311101."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.14,
          0.1515,
          0.163,
          0.1791,
          0.1906,
          0.20379999999999998,
          0.22210000000000002,
          0.24050000000000002,
          0.2589,
          0.2784
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.21,
          0.2273,
          0.2445,
          0.2686,
          0.2858,
          0.3056,
          0.3332,
          0.3607,
          0.3883,
          0.41759999999999997
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311102",
    "characterId": "hsin",
    "name": "Basic Attack - Answering Form Stage 2 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311102; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311102."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0762,
          0.0825,
          0.08869999999999999,
          0.0974,
          0.10369999999999999,
          0.1109,
          0.1209,
          0.1309,
          0.1408,
          0.1515
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.3428,
          0.3709,
          0.39899999999999997,
          0.43829999999999997,
          0.4664,
          0.4987,
          0.5437,
          0.5887,
          0.6335999999999999,
          0.6814
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.2666,
          0.28850000000000003,
          0.3103,
          0.34090000000000004,
          0.3628,
          0.38789999999999997,
          0.4229,
          0.4579,
          0.4928,
          0.53
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311103",
    "characterId": "hsin",
    "name": "Basic Attack - Answering Form Stage 3 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311103; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311103."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.1585,
          0.17149999999999999,
          0.1845,
          0.2027,
          0.2157,
          0.2306,
          0.2514,
          0.2722,
          0.293,
          0.3151
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.1189,
          0.1286,
          0.1384,
          0.152,
          0.1618,
          0.17300000000000001,
          0.1886,
          0.20420000000000002,
          0.2198,
          0.23629999999999998
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.2378,
          0.2572,
          0.2767,
          0.304,
          0.3235,
          0.34590000000000004,
          0.3771,
          0.4083,
          0.4395,
          0.47259999999999996
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311104",
    "characterId": "hsin",
    "name": "Basic Attack - Answering Form Stage 4 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311104; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311104."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.1998,
          0.2162,
          0.23260000000000003,
          0.2555,
          0.27190000000000003,
          0.2907,
          0.3169,
          0.3431,
          0.3693,
          0.3972
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.1998,
          0.2162,
          0.23260000000000003,
          0.2555,
          0.27190000000000003,
          0.2907,
          0.3169,
          0.3431,
          0.3693,
          0.3972
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.5992999999999999,
          0.6485,
          0.6976,
          0.7664,
          0.8156,
          0.8721,
          0.9506999999999999,
          1.0293,
          1.1079,
          1.1915
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311105",
    "characterId": "hsin",
    "name": "Heavy Attack - Answering Form: Reign at Ease DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311105; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 25,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311105."
    ],
    "motionValueCurve": [
      0.14,
      0.1515,
      0.163,
      0.1791,
      0.1906,
      0.20379999999999998,
      0.22210000000000002,
      0.24050000000000002,
      0.2589,
      0.2784
    ]
  },
  {
    "factId": "hsin-damage-1311106",
    "characterId": "hsin",
    "name": "Mid-air Attack - Answering Form: Reign at Ease DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311106; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311106."
    ],
    "motionValueCurve": [
      0.11289999999999999,
      0.12210000000000001,
      0.13140000000000002,
      0.14429999999999998,
      0.1536,
      0.1642,
      0.179,
      0.19390000000000002,
      0.2087,
      0.22440000000000002
    ]
  },
  {
    "factId": "hsin-damage-1311107",
    "characterId": "hsin",
    "name": "Heavy Attack - Answering Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311107; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311107."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.051699999999999996,
          0.0559,
          0.0602,
          0.0661,
          0.0703,
          0.07519999999999999,
          0.08199999999999999,
          0.0888,
          0.0956,
          0.10279999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.10339999999999999,
          0.1118,
          0.12029999999999999,
          0.1322,
          0.1406,
          0.15039999999999998,
          0.16390000000000002,
          0.1775,
          0.1911,
          0.20550000000000002
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.051699999999999996,
          0.0559,
          0.0602,
          0.0661,
          0.0703,
          0.07519999999999999,
          0.08199999999999999,
          0.0888,
          0.0956,
          0.10279999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.10339999999999999,
          0.1118,
          0.12029999999999999,
          0.1322,
          0.1406,
          0.15039999999999998,
          0.16390000000000002,
          0.1775,
          0.1911,
          0.20550000000000002
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "hsin-damage-1311108",
    "characterId": "hsin",
    "name": "Mid-air Attack - Answering Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311108; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311108."
    ],
    "motionValueCurve": [
      0.11289999999999999,
      0.12210000000000001,
      0.13140000000000002,
      0.14429999999999998,
      0.1536,
      0.1642,
      0.179,
      0.19390000000000002,
      0.2087,
      0.22440000000000002
    ]
  },
  {
    "factId": "hsin-damage-1311109",
    "characterId": "hsin",
    "name": "Dodge Counter - Answering Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "DODGE_COUNTER",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311109; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311109."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.2263,
          0.24480000000000002,
          0.2634,
          0.2894,
          0.3079,
          0.3293,
          0.3589,
          0.3886,
          0.4183,
          0.4498
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.3394,
          0.36719999999999997,
          0.3951,
          0.434,
          0.4619,
          0.4939,
          0.5384,
          0.5829,
          0.6274000000000001,
          0.6747
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3394,
          0.36719999999999997,
          0.3951,
          0.434,
          0.4619,
          0.4939,
          0.5384,
          0.5829,
          0.6274000000000001,
          0.6747
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311110",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form Stage 1 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311110; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311110."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0632,
          0.0683,
          0.0735,
          0.0808,
          0.0859,
          0.0919,
          0.1002,
          0.1085,
          0.1167,
          0.1255
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.1894,
          0.20489999999999997,
          0.2205,
          0.2422,
          0.2577,
          0.2756,
          0.3004,
          0.32530000000000003,
          0.35009999999999997,
          0.3765
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311111",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form: Modular Heartlock DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311111; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 2,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311111."
    ],
    "motionValueCurve": [
      0.1052,
      0.1139,
      0.1225,
      0.1346,
      0.1432,
      0.1531,
      0.16690000000000002,
      0.1807,
      0.1945,
      0.20920000000000002
    ]
  },
  {
    "factId": "hsin-damage-1311112",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form Stage 2 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311112; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 2,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311112."
    ],
    "motionValueCurve": [
      0.175,
      0.1894,
      0.20370000000000002,
      0.2238,
      0.2382,
      0.2547,
      0.2777,
      0.3006,
      0.3236,
      0.348
    ]
  },
  {
    "factId": "hsin-damage-1311113",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form Stage 3 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311113; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311113."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0458,
          0.0496,
          0.0533,
          0.058600000000000006,
          0.0623,
          0.0667,
          0.0727,
          0.0787,
          0.08470000000000001,
          0.0911
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.0916,
          0.09910000000000001,
          0.1066,
          0.11710000000000001,
          0.1246,
          0.1333,
          0.14529999999999998,
          0.1573,
          0.1693,
          0.1821
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.1374,
          0.1487,
          0.15990000000000001,
          0.1757,
          0.1869,
          0.1999,
          0.21789999999999998,
          0.2359,
          0.254,
          0.2731
        ],
        "hitCount": 4
      }
    ]
  },
  {
    "factId": "hsin-damage-1311114",
    "characterId": "hsin",
    "name": "Heavy Attack - Illumining Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311114; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 2,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311114."
    ],
    "motionValueCurve": [
      0.2713,
      0.29350000000000004,
      0.31579999999999997,
      0.3469,
      0.36920000000000003,
      0.3947,
      0.4303,
      0.46590000000000004,
      0.5015,
      0.5393
    ]
  },
  {
    "factId": "hsin-damage-1311115",
    "characterId": "hsin",
    "name": "Upward Cut - Illumining Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311115; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311115."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.17620000000000002,
          0.1907,
          0.2051,
          0.2253,
          0.2398,
          0.2564,
          0.27949999999999997,
          0.30260000000000004,
          0.3257,
          0.3503
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.2643,
          0.28600000000000003,
          0.3077,
          0.33799999999999997,
          0.35969999999999996,
          0.3846,
          0.4193,
          0.4539,
          0.4886,
          0.5254
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311116",
    "characterId": "hsin",
    "name": "Mid-air Attack - Illumining Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311116; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311116."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0678,
          0.0733,
          0.0789,
          0.0866,
          0.0922,
          0.0986,
          0.1074,
          0.11630000000000001,
          0.1252,
          0.13470000000000001
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0452,
          0.0489,
          0.0526,
          0.057800000000000004,
          0.061500000000000006,
          0.06570000000000001,
          0.0716,
          0.0776,
          0.08349999999999999,
          0.0898
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311117",
    "characterId": "hsin",
    "name": "Dodge Counter - Illumining Form DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "DODGE_COUNTER",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311117; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 2,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311117."
    ],
    "motionValueCurve": [
      0.4813,
      0.5207999999999999,
      0.5602,
      0.6154999999999999,
      0.6548999999999999,
      0.7003,
      0.7635,
      0.8266,
      0.8896999999999999,
      0.9568000000000001
    ]
  },
  {
    "factId": "hsin-damage-1311118",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form: Pillars Aligned Stage 1 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311118; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 3,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311118."
    ],
    "motionValueCurve": [
      0.1452,
      0.15710000000000002,
      0.16899999999999998,
      0.1857,
      0.19760000000000003,
      0.2113,
      0.2303,
      0.2494,
      0.26839999999999997,
      0.28859999999999997
    ]
  },
  {
    "factId": "hsin-damage-1311119",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form: Pillars Aligned Stage 2 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311119; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 3,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311119."
    ],
    "motionValueCurve": [
      0.1923,
      0.20809999999999998,
      0.22390000000000002,
      0.24600000000000002,
      0.26170000000000004,
      0.2799,
      0.30510000000000004,
      0.33030000000000004,
      0.3555,
      0.3823
    ]
  },
  {
    "factId": "hsin-damage-1311120",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form: Pillars Aligned Stage 3 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311120; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 5,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311120."
    ],
    "motionValueCurve": [
      0.1074,
      0.1162,
      0.125,
      0.1374,
      0.1462,
      0.1563,
      0.1704,
      0.1845,
      0.1986,
      0.21350000000000002
    ]
  },
  {
    "factId": "hsin-damage-1311121",
    "characterId": "hsin",
    "name": "Basic Attack - Illumining Form: Pillars Aligned Stage 4 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311121; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311121."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0837,
          0.0906,
          0.0974,
          0.107,
          0.1139,
          0.12179999999999999,
          0.13269999999999998,
          0.1437,
          0.1547,
          0.1664
        ],
        "hitCount": 7
      },
      {
        "curve": [
          0.251,
          0.2716,
          0.2922,
          0.321,
          0.34149999999999997,
          0.3652,
          0.3981,
          0.4311,
          0.46399999999999997,
          0.499
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311122",
    "characterId": "hsin",
    "name": "Dodge Counter - Illumining Form: Pillars Aligned DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "DODGE_COUNTER",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006101, description row 1311122; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 3,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311122."
    ],
    "motionValueCurve": [
      0.3323,
      0.35960000000000003,
      0.3868,
      0.425,
      0.4522,
      0.4836,
      0.5272,
      0.5708,
      0.6144,
      0.6607
    ]
  },
  {
    "factId": "hsin-skill-1006102-rules",
    "characterId": "hsin",
    "name": "Heartward by Moon",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006102; exact prerequisites are in effectSummary.",
    "effectSummary": "Resonance Skill - Answering Form\nWhile in Answering Form, press Resonance Skill to deal Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 4.\nCan be cast in mid-air.\n\nIf Hsin moves while on the ground within a short time after casting this skill, she turns into the Moon Fox. \n- While in the Moon Fox form and out of combat, Hsin gains Dustless Tread. With Dustless Tread, Hsin can enter the target's aggro range without triggering combat. Dustless Tread is removed when Hsin enters combat, is switched out, or ends the Moon Fox form by having environmental, gameplay, or feature interactions.\n- While in the Moon Fox form and out of combat, Hsin restores 6% of Max HP every 3s.\n- Taking damage, failing to perform a Dodge with directional input while on the ground, or Dodging in mid-air will end the Moon Fox form. Switching to another Resonator or pressing Resonance Skill also ends the Moon Fox form. Press Normal Attack to cast Basic Attack - Answering Form Stage 4, which also ends the Moon Fox form.\n- The Dash state continuously consumes STA when Hsin is in the Moon Fox form.\n- Resonance Liberation is disabled when Hsin is in the Moon Fox form.\n\nResonance Skill - Illumining Form\nWhile in Illumining Form and Hsin is on the ground, press Resonance Skill to have Hsin command a Colossal Xuanfang Mechanism, dealing Electro DMG.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-damage-1311201",
    "characterId": "hsin",
    "name": "Resonance Skill - Answering Form DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006102, description row 1311201; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311201."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.126,
          0.1364,
          0.1467,
          0.1612,
          0.17149999999999999,
          0.1834,
          0.1999,
          0.2165,
          0.233,
          0.2506
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.126,
          0.1364,
          0.1467,
          0.1612,
          0.17149999999999999,
          0.1834,
          0.1999,
          0.2165,
          0.233,
          0.2506
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.126,
          0.1364,
          0.1467,
          0.1612,
          0.17149999999999999,
          0.1834,
          0.1999,
          0.2165,
          0.233,
          0.2506
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.084,
          0.0909,
          0.0978,
          0.1075,
          0.1144,
          0.1223,
          0.1333,
          0.14429999999999998,
          0.1553,
          0.1671
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.294,
          0.3182,
          0.3423,
          0.376,
          0.40009999999999996,
          0.4278,
          0.4664,
          0.505,
          0.5436,
          0.5846
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311202",
    "characterId": "hsin",
    "name": "Resonance Skill - Illumining Form DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006102, description row 1311202; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311202."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.055999999999999994,
          0.060599999999999994,
          0.0652,
          0.0717,
          0.07629999999999999,
          0.0815,
          0.0889,
          0.0962,
          0.1036,
          0.1114
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.8959999999999999,
          0.9695,
          1.043,
          1.1459000000000001,
          1.2193,
          1.3037999999999998,
          1.4213999999999998,
          1.5389,
          1.6565,
          1.7813999999999999
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-skill-1006103-rules",
    "characterId": "hsin",
    "name": "Nexus Alight",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006103; exact prerequisites are in effectSummary.",
    "effectSummary": "Formshift\nCasting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector unlocks Formshift.\nCast Formshift to unfurl the Manifold Sanctum. Hsin switches to Illumining Form, unlocking a new set of combat abilities, and enters the Heart Manifest state.\nCan be cast in mid-air close to the ground.\nWhile in Illumining Form, engaging in quest dialogue, performing an environmental interaction with an animation, or using a Utility switches Hsin back to Answering Form to perform the corresponding action.\nWhile in Illumining Form, Hsin can walk on the surface of water, and will continuously consume STA in deep water areas. In Walking Mode, Hsin in Illumining Form can step off a cliff into the air and walk slowly in mid-air, continuously consuming STA in this state. Hsin cannot restore STA while in Illumining Form and in mid-air.\n\nPillars Across Heaven\nAfter casting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons, when in Illumining Form with full Resonance Energy, Pillars Across Heaven becomes available.\nCast Pillars Across Heaven to bring the Manifold Sanctum crashing down, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCan be cast in mid-air close to the ground.\nHsin returns to Answering Form and exits the Heart Manifest state.\n\nEdict\nCasting Formshift grants Hsin 21 stacks of Edict for 45s. The effect cannot exceed 21 stacks and all stacks are removed when the duration ends.\nAfter a Resonator on the field deals DMG, Hsin automatically consumes Edict in the following 3s to trigger the following effect up to once per second. Retriggering the effect resets the duration:\n- When Edict is consumed, summon a Soaring Pillar from the Manifold Sanctum as a Coordinated Attack to strike the target once, dealing Electro DMG. \n- Edict can be automatically consumed up to 1 stack per second.\n- Damage dealt by Soaring Pillar does not trigger this effect.\n- When Hsin is knocked out, all Edict stacks are removed.\n\nHeart Manifest\nIncreases Hsin's resistance to interruption for 45s.\nEntering the Heart Manifest state resets Hsin's Illumining Form.\nWhile in the Heart Manifest state and in Illumining Form, if Pillars Across Heaven is locked, press Resonance Liberation to have Hsin cast Invoked Form: Answering. While in Answering Form, press Resonance Liberation to have Hsin cast Invoked Form: Illumining.\nBesides, if Hsin is still in Illumining Form after exiting Heart Manifest, and Pillars Across Heaven is locked, press Resonance Liberation to have Hsin cast Invoked Form: Answering.\n\nInvoked Form: Answering\nHsin temporarily reverts to Answering Form. When this skill is cast, if Hsin is on the ground, She casts Basic Attack - Answering Form Stage 2; if She is in mid-air, She casts Mid-air Attack - Answering Form.\n\nInvoked Form: Illumining\nHsin turns back into Illumining Form. When this skill is cast, if Hsin is on the ground, She casts Upward Cut - Illumining Form; if She is in mid-air, She casts Mid-air Attack - Illumining Form.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-damage-1311302",
    "characterId": "hsin",
    "name": "Pillars Across Heaven DMG",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "LIBERATION",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006103, description row 1311302; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311302."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.405,
          0.4382,
          0.4714,
          0.5179,
          0.5511,
          0.5893,
          0.6424,
          0.6955,
          0.7487,
          0.8051
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.4556,
          0.493,
          0.5303,
          0.5826,
          0.62,
          0.6629,
          0.7227,
          0.7825,
          0.8422,
          0.9057
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3038,
          0.3287,
          0.35359999999999997,
          0.3884,
          0.4133,
          0.442,
          0.4818,
          0.5217,
          0.5615,
          0.6038
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.5062,
          0.5477000000000001,
          0.5892000000000001,
          0.6473,
          0.6888,
          0.7365999999999999,
          0.8029999999999999,
          0.8694,
          0.9358,
          1.0064
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3544,
          0.3834,
          0.4125,
          0.4532,
          0.48219999999999996,
          0.5156000000000001,
          0.5621,
          0.6086,
          0.6551,
          0.7045
        ],
        "hitCount": 1
      },
      {
        "curve": [
          8.0988,
          8.7629,
          9.427,
          10.3567,
          11.0208,
          11.784500000000001,
          12.847100000000001,
          13.9097,
          14.9722,
          16.1012
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311303",
    "characterId": "hsin",
    "name": "Soaring Pillar DMG",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "LIBERATION",
    "actionKind": "LIBERATION",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006103, description row 1311303; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311303."
    ],
    "motionValueCurve": [
      0.0572,
      0.061900000000000004,
      0.0666,
      0.0731,
      0.07780000000000001,
      0.0832,
      0.0907,
      0.09820000000000001,
      0.1057,
      0.1137
    ]
  },
  {
    "factId": "hsin-skill-1006104-rules",
    "characterId": "hsin",
    "name": "Tides of Succession",
    "section": "INHERENT_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006104; exact prerequisites are in effectSummary.",
    "effectSummary": "While in Resonance Mode - Unison, when Hsin casts Intro Skill - Answering Form: Manifold Unison or Intro Skill - Illumining Form: Manifold Unison, Her ATK is increased by 50% for 8s. Switching to another Resonator or Resonance Mode ends this effect.\n\nWhile in Resonance Mode - Electro Flare, after Resonators in the team inflict Electro Flare, Hsin gains 25% Electro DMG Bonus, stacking up to 2 times. Each Resonator can trigger this effect only once. In addition, if Rover: Electro is in the same team, when Rover: Electro casts Intro Skill - Thunderous Fury, both Hsin and Rover: Electro gain 20% Electro DMG Bonus for 30s.\nThis effect resets when a Resonator is added to the team or when Hsin switches Resonance Mode.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-skill-1006105-rules",
    "characterId": "hsin",
    "name": "Gleaning Simple Joys",
    "section": "INHERENT_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006105; exact prerequisites are in effectSummary.",
    "effectSummary": "While in Resonance Mode - Unison, the maximum stacks of the Unison Boon effect on Resonators in the team are increased by 1. When a Resonator in the team triggers Unison Response, all Resonators in the team gain 1 stacks of Unison Boon for 30s. This effect does not stack.\n\nWhile in Resonance Mode - Electro Flare and Hsin is not in the Heart Manifest state, after Resonators in the team other than Hsin inflict Electro Flare on a target, every 1 stack of Electro Flare inflicted grants Hisn 1 stack of Thunderglow, stacking up to 10 times.\nWhile Hsin is in the Heart Manifest state, when targets within a certain range have 0 stacks of Electro Flare, inflict 1 stack of Electro Flare on the targets. If Thunderglow on Hsin reaches the stack limit, Hsin also inflicts Fleeting Thunder on the targets:\n- When Hsin inflicts Fleeting Thunder on the target, She also inflicts Electro Flare on the target to the stack limit, up to 16 stacks of Electro Flare.\n- When Fleeting Thunder is active, if the maximum stacks of Electro Flare on the target is increased, Hsin will inflict Electro Flare on the target to the stack limit again, up to 16 stacks of Electro Flare.\n- Fleeting Thunder will be removed when the target leaves the designated range around Hsin.\nExiting the Heart Manifest state or switching Resonance Mode removes the aforementioned effects.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-skill-1006106-rules",
    "characterId": "hsin",
    "name": "Glance on a Whim",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006106; exact prerequisites are in effectSummary.",
    "effectSummary": "Intro Skill - Answering Form\nThis skill becomes available while in Answering Form. Attack the target, dealing Electro DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 3 (when in Resonance Mode - Unison) or Basic Attack - Answering Form Stage 4 (when in Resonance Mode - Electro Flare).\n\nIntro Skill - Answering Form: Manifold Unison\nThis skill becomes available while in Answering Form. Attack the target, dealing greater Electro DMG, considered Resonance Skill DMG.\nAfter casting this skill, press Normal Attack within a short time to cast Basic Attack - Answering Form Stage 3.\n\nIntro Skill - Illumining Form\nThis skill becomes available while in Illumining Form. Attack the target, dealing Electro DMG.\n\nIntro Skill - Illumining Form: Manifold Unison\nThis skill becomes available while in Illumining Form. Attack the target, dealing greater Electro DMG, considered Resonance Skill DMG.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-damage-1311601",
    "characterId": "hsin",
    "name": "Intro Skill - Answering Form DMG in Resonance Mode - Electro Flare",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "INTRO",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311601; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311601."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0397,
          0.0429,
          0.0462,
          0.0507,
          0.054000000000000006,
          0.057699999999999994,
          0.0629,
          0.0681,
          0.0733,
          0.0788
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.0397,
          0.0429,
          0.0462,
          0.0507,
          0.054000000000000006,
          0.057699999999999994,
          0.0629,
          0.0681,
          0.0733,
          0.0788
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.6339,
          0.6859000000000001,
          0.7379000000000001,
          0.8106,
          0.8626,
          0.9224,
          1.0056,
          1.0887,
          1.1719,
          1.2602
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311602",
    "characterId": "hsin",
    "name": "Intro Skill - Answering Form DMG in Resonance Mode - Unison",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "INTRO",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311602; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311602."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.051699999999999996,
          0.0559,
          0.0602,
          0.0661,
          0.0703,
          0.07519999999999999,
          0.08199999999999999,
          0.0888,
          0.0956,
          0.10279999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.10339999999999999,
          0.1118,
          0.12029999999999999,
          0.1322,
          0.1406,
          0.15039999999999998,
          0.16390000000000002,
          0.1775,
          0.1911,
          0.20550000000000002
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.051699999999999996,
          0.0559,
          0.0602,
          0.0661,
          0.0703,
          0.07519999999999999,
          0.08199999999999999,
          0.0888,
          0.0956,
          0.10279999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.10339999999999999,
          0.1118,
          0.12029999999999999,
          0.1322,
          0.1406,
          0.15039999999999998,
          0.16390000000000002,
          0.1775,
          0.1911,
          0.20550000000000002
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "hsin-damage-1311603",
    "characterId": "hsin",
    "name": "Intro Skill - Answering Form: Manifold Unison DMG",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311603; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311603."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.3048,
          0.3298,
          0.35479999999999995,
          0.3898,
          0.4147,
          0.4435,
          0.48350000000000004,
          0.5235,
          0.5634,
          0.6059
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.6095,
          0.6595,
          0.7095,
          0.7795000000000001,
          0.8294,
          0.8869,
          0.9669,
          1.0469,
          1.1268,
          1.2118
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3048,
          0.3298,
          0.35479999999999995,
          0.3898,
          0.4147,
          0.4435,
          0.48350000000000004,
          0.5235,
          0.5634,
          0.6059
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.6095,
          0.6595,
          0.7095,
          0.7795000000000001,
          0.8294,
          0.8869,
          0.9669,
          1.0469,
          1.1268,
          1.2118
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "hsin-damage-1311604",
    "characterId": "hsin",
    "name": "Intro Skill - Illumining Form DMG in Resonance Mode - Electro Flare",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "INTRO",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311604; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311604."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0575,
          0.0622,
          0.0669,
          0.0735,
          0.0782,
          0.0836,
          0.09119999999999999,
          0.0987,
          0.10619999999999999,
          0.1142
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.0575,
          0.0622,
          0.0669,
          0.0735,
          0.0782,
          0.0836,
          0.09119999999999999,
          0.0987,
          0.10619999999999999,
          0.1142
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.2011,
          0.21760000000000002,
          0.23399999999999999,
          0.2571,
          0.2736,
          0.2926,
          0.3189,
          0.3453,
          0.37170000000000003,
          0.3997
        ],
        "hitCount": 4
      }
    ]
  },
  {
    "factId": "hsin-damage-1311605",
    "characterId": "hsin",
    "name": "Intro Skill - Illumining Form DMG in Resonance Mode - Unison",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "INTRO",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311605; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311605."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.2847,
          0.308,
          0.33130000000000004,
          0.364,
          0.3874,
          0.4142,
          0.4515,
          0.4889,
          0.5262,
          0.5659000000000001
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.0285,
          0.0308,
          0.0332,
          0.0364,
          0.0388,
          0.0415,
          0.0452,
          0.0489,
          0.0527,
          0.056600000000000004
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.057,
          0.0616,
          0.0663,
          0.0728,
          0.0775,
          0.08289999999999999,
          0.09029999999999999,
          0.0978,
          0.10529999999999999,
          0.11320000000000001
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.0712,
          0.077,
          0.08289999999999999,
          0.091,
          0.0969,
          0.1036,
          0.11289999999999999,
          0.1223,
          0.1316,
          0.14150000000000001
        ],
        "hitCount": 2
      }
    ]
  },
  {
    "factId": "hsin-damage-1311606",
    "characterId": "hsin",
    "name": "Intro Skill - Illumining Form: Manifold Unison DMG",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006106, description row 1311606; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311606."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.7908,
          0.8556999999999999,
          0.9205,
          1.0112999999999999,
          1.0762,
          1.1506999999999998,
          1.2545,
          1.3581999999999999,
          1.462,
          1.5722
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.0791,
          0.08560000000000001,
          0.09210000000000002,
          0.1012,
          0.10769999999999999,
          0.1151,
          0.1255,
          0.1359,
          0.1462,
          0.1573
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.1582,
          0.17120000000000002,
          0.1841,
          0.2023,
          0.21530000000000002,
          0.2302,
          0.2509,
          0.2717,
          0.2924,
          0.3145
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.1977,
          0.214,
          0.2302,
          0.2529,
          0.2691,
          0.2877,
          0.31370000000000003,
          0.3396,
          0.3655,
          0.3931
        ],
        "hitCount": 2
      }
    ]
  },
  {
    "factId": "hsin-skill-1006107-rules",
    "characterId": "hsin",
    "name": "Forms Turn, Heart Abides",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1006107; exact prerequisites are in effectSummary.",
    "effectSummary": "Forms Born of Heart\nWhile in Answering Form, Hsin can gain and consume Answering Heart.\nWhile in Illumining Form, Hsin can gain and consume Illumining Heart.\n\nHeavy Attack - Answering Form: Realm Wanderer\nWhile in Answering Form, when Hsin's Answering Heart reaches 100 points, Heavy Attack - Answering Form is replaced with Heavy Attack - Answering Form: Realm Wanderer.\nHold Normal Attack to cast the skill at the cost of STA and 100 points of Answering Heart. Hsin is immune to interruption during the action, and deals Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Answering Form: Realm Wanderer grants Hsin Resolution of Wishes. This Heavy Attack - Answering Form: Realm Wanderer consumes Resolution of Wishes to become Heavy Attack - Answering Form: Realm Protector, dealing greater DMG. Resolution of Wishes can only be gained once every 24s.\nWhile casting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector, if Hsin is not in the Heart Manifest state, unlock Resonance Liberation - Formshift.\n\nHeavy Attack - Illumining Form: Beholding All Horizons\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 0 during the Mechanism Dominion state, Heavy Attack - Illumining Form is replaced with Heavy Attack - Illumining Form: Beholding All Horizons.\nHold Normal Attack to cast the skill at the cost of STA, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons grants Hsin Law of Heaven. This Heavy Attack - Illumining Form: Beholding All Horizons consumes Law of Heaven to become Heavy Attack - Illumining Form: Stilling All Horizons, dealing greater DMG. Law of Heaven can only be gained once every 24s.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons ends the Mechanism Dominion state and unlocks Resonance Liberation - Pillars Across Heaven.\nCan be cast in mid-air.\n\nResonance Skill - Illumining Form: Pillars Aligned\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 300 points and She is on the ground, Resonance Skill is replaced with Resonance Skill - Illumining Form: Pillars Aligned.\nWhen Hsin is on the ground, press Resonance Skill to deal Electro DMG to surrounding targets.\nCasting Resonance Skill - Illumining Form: Pillars Aligned sends Hsin into the Mechanism Dominion state.\n\nMechanism Dominion\nThe Mechanism Dominion state lasts 13s.\nWhile this state is active, Basic Attack - Illumining Form is replaced with Basic Attack - Illumining Form: Pillars Aligned, and Dodge Counter - Illumining Form is replaced with Dodge Counter - Illumining Form: Pillars Aligned.\nWhen Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned hits a target, Illumining Heart is consumed if Hsin is the active Resonator.\nExiting Mechanism Dominion clears Illumining Heart.\n\nResonance Mode - Unison\nWhile in Resonance Mode - Unison, Hsin gains the following effects:\n- Hsin can trigger Unison Response, but not in Co-op Mode.\n- After casting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison, the next Resonance Liberation - Formshift grants Hsin Unison for 5s.\n- When Hsin triggers Unison Response, She gains Source Intent, and this cast of Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\nWhen Hsin casts an Intro Skill without triggering Unison Response while holding Source Intent, She consumes Source Intent instead, and the Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\n- The aforementioned effects are removed when Hsin switches Resonance Mode.\n- Casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison sends Hsin directly into the Mechanism Dominion state.\n\nResonance Mode - Electro Flare\nWhile in Resonance Mode - Electro Flare, Hsin gains the following effects:\n- When Hsin enters combat, targets within a certain range do not lose Electro Flare stacks when it's triggered.\n- After Resonators in the team inflict Electro Rage on a target, every 1 stacks of Electro Rage inflicted grants Hsin 1 stacks of Heart of Thunder, stacking up to 100 times, and consumes all Electro Rage stacks from that target. Heart of Thunder is removed when Hsin switches Resonance Mode.\n- At the last stage of Resonance Skill - Heartward by Moon, Hsin actively triggers 1 instance of Electro Flare DMG on the targets. Its DMG Multiplier is equal to 35% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks).\nWhile casting Resonance Skill - Heartward by Moon, switching to another Resonator or ending the skill early removes the above effects.\nSome time after casting Resonance Skill - Heartward by Moon, Hsin consumes all remaining stacks of Heart of Thunder.\nWhen Hsin has at least 50 stacks of Heart of Thunder, Resonance Skill - Illumining Form stagnates nearby targets during the action.\n- After casting Resonance Liberation - Formshift, inflict 5 stacks of Electro Flare on nearby targets within a certain range. It also makes Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned inflict Electro Flare on hit targets, up to 5 times. Casting Resonance Liberation - Formshift again resets this count. Switching Resonance Mode removes it.\nResonance Skill - Illumining Form: Pillars Aligned and Heavy Attack - Illumining Form: Stilling All Horizons inflict 5 stacks of Electro Flare on the target hit. Intro Skill - Illumining Form, Intro Skill - Answering Form, and Heavy Attack - Answering Form: Realm Protector inflict 1 stacks of Electro Flare on the target hit.\n\nUnison\nWhile Hsin is in Resonance Mode - Unison with Unison, switching to another Resonator will remove Hsin's Unison to trigger Hsin's Outro Skill and the incoming Resonator's Intro Skill. If Hsin has full Concerto Energy and Unison at the same time, only Unison is consumed to trigger the effect.\n\nUnison Response\nWhile Hsin is in Resonance Mode - Unison and the active Resonator in the team has Unison, Hsin triggers Unison Response after She is switched in and casts Intro Skill, granting 1 stacks of Unison Boon to all Resonators in the team for 30s.\nHsin can only grant up to 1 stacks of Unison Boon in this way.\n\nUnison Boon\nOnly the Resonators who can trigger Unison Response can gain this effect. Each stack of Unison Boon increases the total DMG dealt by Resonators who can trigger Unison Response in the team by 3%, stacking up to 2 times.\n\nAnswering Heart\nCan hold up to 100 points of Answering Heart.\nWhile in Answering Form, when Normal Attack - Answering Form, Resonance Skill - Answering Form, Intro Skill - Answering Form, or Intro Skill - Answering Form: Manifold Unison hits a target, Hsin gains Answering Heart if She is the active Resonator.\nCasting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison grants 60 points of Answering Heart.\n\nIllumining Heart\nCan hold up to 300 points of Illumining Heart.\nWhile in Illumining Form and not in the Mechanism Dominion state, when Normal Attack - Illumining Form, Resonance Skill - Illumining Form, or Intro Skill - Illumining Form hits a target, Hsin gains Illumining Heart if She is the active Resonator.\n- While in Resonance Mode - Unison, casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison directly sends Hsin into the Mechanism Dominion state and grants 300 points of Illumining Heart.\n- While in Resonance Mode - Electro Flare, after casting Resonance Liberation - Formshift, when the Modular Heartlock generated by Basic Attack - Illumining Form Stage 1 is collapsed by Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form, additionally gain 150 points of Illumining Heart if Hsin is the active Resonator in Illumining Form but not in the Mechanism Dominion state. This effect can only be triggered once before the next cast of Resonance Liberation - Formshift resets it, and is disabled when switched to the other Resonance Mode.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-damage-1311701",
    "characterId": "hsin",
    "name": "Heavy Attack - Answering Form: Realm Wanderer DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006107, description row 1311701; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311701."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.2296,
          0.24850000000000003,
          0.2673,
          0.29359999999999997,
          0.3125,
          0.33409999999999995,
          0.3642,
          0.3944,
          0.42450000000000004,
          0.45649999999999996
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0574,
          0.0622,
          0.0669,
          0.07339999999999999,
          0.0782,
          0.0836,
          0.0911,
          0.0986,
          0.10619999999999999,
          0.1142
        ],
        "hitCount": 6
      },
      {
        "curve": [
          2.2959,
          2.4842,
          2.6725,
          2.9360000000000004,
          3.1243,
          3.3407999999999998,
          3.642,
          3.9432,
          4.2444999999999995,
          4.5645
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311702",
    "characterId": "hsin",
    "name": "Heavy Attack - Answering Form: Realm Protector DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006107, description row 1311702; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311702."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.4996,
          0.5406,
          0.5815,
          0.6389,
          0.6798000000000001,
          0.7269,
          0.7925,
          0.858,
          0.9236,
          0.9932
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.1249,
          0.1352,
          0.1454,
          0.1598,
          0.17,
          0.1818,
          0.19820000000000002,
          0.2145,
          0.2309,
          0.2483
        ],
        "hitCount": 6
      },
      {
        "curve": [
          4.9955,
          5.4051,
          5.8148,
          6.3883,
          6.797899999999999,
          7.269,
          7.9244,
          8.5798,
          9.235199999999999,
          9.9315
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311703",
    "characterId": "hsin",
    "name": "Heavy Attack - Illumining Form: Beholding All Horizons DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006107, description row 1311703; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311703."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.051699999999999996,
          0.0559,
          0.0602,
          0.0661,
          0.0703,
          0.07519999999999999,
          0.08199999999999999,
          0.0888,
          0.0955,
          0.1027
        ],
        "hitCount": 4
      },
      {
        "curve": [
          1.8596000000000001,
          2.012,
          2.1645,
          2.378,
          2.5305,
          2.7058,
          2.9498,
          3.1938,
          3.4377,
          3.697
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311704",
    "characterId": "hsin",
    "name": "Heavy Attack - Illumining Form: Stilling All Horizons DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006107, description row 1311704; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311704."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.1361,
          0.1472,
          0.15839999999999999,
          0.174,
          0.18510000000000001,
          0.198,
          0.2158,
          0.23370000000000002,
          0.2515,
          0.2705
        ],
        "hitCount": 4
      },
      {
        "curve": [
          4.8966,
          5.2981,
          5.6996,
          6.261799999999999,
          6.6633000000000004,
          7.125,
          7.7675,
          8.4099,
          9.0523,
          9.7349
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "hsin-damage-1311203",
    "characterId": "hsin",
    "name": "Resonance Skill - Illumining Form: Pillars Aligned DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1006107, description row 1311203; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1311203."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.9026000000000001,
          0.9765999999999999,
          1.0506,
          1.1542000000000001,
          1.2282,
          1.3133000000000001,
          1.4317,
          1.5500999999999998,
          1.6684999999999999,
          1.7943
        ],
        "hitCount": 4
      },
      {
        "curve": [
          0.09029999999999999,
          0.0977,
          0.1051,
          0.1155,
          0.1229,
          0.13140000000000002,
          0.1432,
          0.1551,
          0.16690000000000002,
          0.1795
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.18059999999999998,
          0.1954,
          0.2102,
          0.2309,
          0.2457,
          0.2627,
          0.2864,
          0.31010000000000004,
          0.3337,
          0.3589
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.2257,
          0.24420000000000003,
          0.2627,
          0.28859999999999997,
          0.3071,
          0.3284,
          0.358,
          0.3876,
          0.4172,
          0.4486
        ],
        "hitCount": 2
      }
    ]
  },
  {
    "factId": "hsin-skill-1006109-rules",
    "characterId": "hsin",
    "name": "Herself a Thousand Lanterns",
    "section": "OUTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "OTHER",
    "triggerSummary": "Source skill 1006109; exact prerequisites are in effectSummary.",
    "effectSummary": "Attack the target, dealing Electro DMG equal to 100% of Hsin's ATK.\nHsin gains Nightglow upon entering combat or casting Resonance Liberation - Pillars Across Heaven. When Hsin casts Outro Skill, Nightglow is consumed to trigger various effects depending on the Resonance Mode She is in:\n- While in Resonance Mode - Unison, Resonators in the team other than Hsin gain Shared Light when they gain Unison. After Hsin casts Outro Skill, Resonators with Shared Light gain 20% All DMG Amplification for 30s.\n- While in Resonance Mode - Electro Flare, Resonators in the team other than Hsin gain 20% Electro DMG Amplification for 20s.\nThe above effects end early when Hsin switches Resonance Mode.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "hsin-outro-source-damage",
    "characterId": "hsin",
    "name": "Herself a Thousand Lanterns — damage",
    "section": "OUTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "OUTRO",
    "actionRole": "DAMAGE",
    "damageClass": "OUTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "sourceFixedMotionValue": 1,
    "motionValueContext": "Fixed source Outro coefficient; no skill-level curve.",
    "hitCount": 1
  },
  {
    "factId": "hsin-tune-break-source",
    "characterId": "hsin",
    "name": "Tune Break: Rectifier",
    "section": "TUNE_BREAK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "PENDING_INTERPRETATION",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "TUNE_BREAK",
    "actionRole": "SHARED_SYSTEM_DAMAGE",
    "damageClass": "OTHER",
    "scalingStat": "SHARED_SYSTEM",
    "motionValue": null,
    "motionValueContext": "The source grants Tune Break access; damage belongs to the shared Tune Break system, not a Character skill curve.",
    "hitCount": null,
    "notes": [
      "When the target's Off-Tune Level is full, the Resonator may cast Tune Break on the target."
    ]
  },
  {
    "factId": "hsin-resource-answering-heart",
    "characterId": "hsin",
    "name": "Answering Heart",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Answering Heart",
    "maxValue": 100,
    "ruleSummary": "Forms Born of Heart\nWhile in Answering Form, Hsin can gain and consume Answering Heart.\nWhile in Illumining Form, Hsin can gain and consume Illumining Heart.\n\nHeavy Attack - Answering Form: Realm Wanderer\nWhile in Answering Form, when Hsin's Answering Heart reaches 100 points, Heavy Attack - Answering Form is replaced with Heavy Attack - Answering Form: Realm Wanderer.\nHold Normal Attack to cast the skill at the cost of STA and 100 points of Answering Heart. Hsin is immune to interruption during the action, and deals Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Answering Form: Realm Wanderer grants Hsin Resolution of Wishes. This Heavy Attack - Answering Form: Realm Wanderer consumes Resolution of Wishes to become Heavy Attack - Answering Form: Realm Protector, dealing greater DMG. Resolution of Wishes can only be gained once every 24s.\nWhile casting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector, if Hsin is not in the Heart Manifest state, unlock Resonance Liberation - Formshift.\n\nHeavy Attack - Illumining Form: Beholding All Horizons\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 0 during the Mechanism Dominion state, Heavy Attack - Illumining Form is replaced with Heavy Attack - Illumining Form: Beholding All Horizons.\nHold Normal Attack to cast the skill at the cost of STA, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons grants Hsin Law of Heaven. This Heavy Attack - Illumining Form: Beholding All Horizons consumes Law of Heaven to become Heavy Attack - Illumining Form: Stilling All Horizons, dealing greater DMG. Law of Heaven can only be gained once every 24s.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons ends the Mechanism Dominion state and unlocks Resonance Liberation - Pillars Across Heaven.\nCan be cast in mid-air.\n\nResonance Skill - Illumining Form: Pillars Aligned\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 300 points and She is on the ground, Resonance Skill is replaced with Resonance Skill - Illumining Form: Pillars Aligned.\nWhen Hsin is on the ground, press Resonance Skill to deal Electro DMG to surrounding targets.\nCasting Resonance Skill - Illumining Form: Pillars Aligned sends Hsin into the Mechanism Dominion state.\n\nMechanism Dominion\nThe Mechanism Dominion state lasts 13s.\nWhile this state is active, Basic Attack - Illumining Form is replaced with Basic Attack - Illumining Form: Pillars Aligned, and Dodge Counter - Illumining Form is replaced with Dodge Counter - Illumining Form: Pillars Aligned.\nWhen Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned hits a target, Illumining Heart is consumed if Hsin is the active Resonator.\nExiting Mechanism Dominion clears Illumining Heart.\n\nResonance Mode - Unison\nWhile in Resonance Mode - Unison, Hsin gains the following effects:\n- Hsin can trigger Unison Response, but not in Co-op Mode.\n- After casting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison, the next Resonance Liberation - Formshift grants Hsin Unison for 5s.\n- When Hsin triggers Unison Response, She gains Source Intent, and this cast of Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\nWhen Hsin casts an Intro Skill without triggering Unison Response while holding Source Intent, She consumes Source Intent instead, and the Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\n- The aforementioned effects are removed when Hsin switches Resonance Mode.\n- Casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison sends Hsin directly into the Mechanism Dominion state.\n\nResonance Mode - Electro Flare\nWhile in Resonance Mode - Electro Flare, Hsin gains the following effects:\n- When Hsin enters combat, targets within a certain range do not lose Electro Flare stacks when it's triggered.\n- After Resonators in the team inflict Electro Rage on a target, every 1 stacks of Electro Rage inflicted grants Hsin 1 stacks of Heart of Thunder, stacking up to 100 times, and consumes all Electro Rage stacks from that target. Heart of Thunder is removed when Hsin switches Resonance Mode.\n- At the last stage of Resonance Skill - Heartward by Moon, Hsin actively triggers 1 instance of Electro Flare DMG on the targets. Its DMG Multiplier is equal to 35% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks).\nWhile casting Resonance Skill - Heartward by Moon, switching to another Resonator or ending the skill early removes the above effects.\nSome time after casting Resonance Skill - Heartward by Moon, Hsin consumes all remaining stacks of Heart of Thunder.\nWhen Hsin has at least 50 stacks of Heart of Thunder, Resonance Skill - Illumining Form stagnates nearby targets during the action.\n- After casting Resonance Liberation - Formshift, inflict 5 stacks of Electro Flare on nearby targets within a certain range. It also makes Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned inflict Electro Flare on hit targets, up to 5 times. Casting Resonance Liberation - Formshift again resets this count. Switching Resonance Mode removes it.\nResonance Skill - Illumining Form: Pillars Aligned and Heavy Attack - Illumining Form: Stilling All Horizons inflict 5 stacks of Electro Flare on the target hit. Intro Skill - Illumining Form, Intro Skill - Answering Form, and Heavy Attack - Answering Form: Realm Protector inflict 1 stacks of Electro Flare on the target hit.\n\nUnison\nWhile Hsin is in Resonance Mode - Unison with Unison, switching to another Resonator will remove Hsin's Unison to trigger Hsin's Outro Skill and the incoming Resonator's Intro Skill. If Hsin has full Concerto Energy and Unison at the same time, only Unison is consumed to trigger the effect.\n\nUnison Response\nWhile Hsin is in Resonance Mode - Unison and the active Resonator in the team has Unison, Hsin triggers Unison Response after She is switched in and casts Intro Skill, granting 1 stacks of Unison Boon to all Resonators in the team for 30s.\nHsin can only grant up to 1 stacks of Unison Boon in this way.\n\nUnison Boon\nOnly the Resonators who can trigger Unison Response can gain this effect. Each stack of Unison Boon increases the total DMG dealt by Resonators who can trigger Unison Response in the team by 3%, stacking up to 2 times.\n\nAnswering Heart\nCan hold up to 100 points of Answering Heart.\nWhile in Answering Form, when Normal Attack - Answering Form, Resonance Skill - Answering Form, Intro Skill - Answering Form, or Intro Skill - Answering Form: Manifold Unison hits a target, Hsin gains Answering Heart if She is the active Resonator.\nCasting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison grants 60 points of Answering Heart.\n\nIllumining Heart\nCan hold up to 300 points of Illumining Heart.\nWhile in Illumining Form and not in the Mechanism Dominion state, when Normal Attack - Illumining Form, Resonance Skill - Illumining Form, or Intro Skill - Illumining Form hits a target, Hsin gains Illumining Heart if She is the active Resonator.\n- While in Resonance Mode - Unison, casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison directly sends Hsin into the Mechanism Dominion state and grants 300 points of Illumining Heart.\n- While in Resonance Mode - Electro Flare, after casting Resonance Liberation - Formshift, when the Modular Heartlock generated by Basic Attack - Illumining Form Stage 1 is collapsed by Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form, additionally gain 150 points of Illumining Heart if Hsin is the active Resonator in Illumining Form but not in the Mechanism Dominion state. This effect can only be triggered once before the next cast of Resonance Liberation - Formshift resets it, and is disabled when switched to the other Resonance Mode.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-resource-illumining-heart",
    "characterId": "hsin",
    "name": "Illumining Heart",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Illumining Heart",
    "maxValue": 300,
    "ruleSummary": "Forms Born of Heart\nWhile in Answering Form, Hsin can gain and consume Answering Heart.\nWhile in Illumining Form, Hsin can gain and consume Illumining Heart.\n\nHeavy Attack - Answering Form: Realm Wanderer\nWhile in Answering Form, when Hsin's Answering Heart reaches 100 points, Heavy Attack - Answering Form is replaced with Heavy Attack - Answering Form: Realm Wanderer.\nHold Normal Attack to cast the skill at the cost of STA and 100 points of Answering Heart. Hsin is immune to interruption during the action, and deals Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Answering Form: Realm Wanderer grants Hsin Resolution of Wishes. This Heavy Attack - Answering Form: Realm Wanderer consumes Resolution of Wishes to become Heavy Attack - Answering Form: Realm Protector, dealing greater DMG. Resolution of Wishes can only be gained once every 24s.\nWhile casting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector, if Hsin is not in the Heart Manifest state, unlock Resonance Liberation - Formshift.\n\nHeavy Attack - Illumining Form: Beholding All Horizons\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 0 during the Mechanism Dominion state, Heavy Attack - Illumining Form is replaced with Heavy Attack - Illumining Form: Beholding All Horizons.\nHold Normal Attack to cast the skill at the cost of STA, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons grants Hsin Law of Heaven. This Heavy Attack - Illumining Form: Beholding All Horizons consumes Law of Heaven to become Heavy Attack - Illumining Form: Stilling All Horizons, dealing greater DMG. Law of Heaven can only be gained once every 24s.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons ends the Mechanism Dominion state and unlocks Resonance Liberation - Pillars Across Heaven.\nCan be cast in mid-air.\n\nResonance Skill - Illumining Form: Pillars Aligned\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 300 points and She is on the ground, Resonance Skill is replaced with Resonance Skill - Illumining Form: Pillars Aligned.\nWhen Hsin is on the ground, press Resonance Skill to deal Electro DMG to surrounding targets.\nCasting Resonance Skill - Illumining Form: Pillars Aligned sends Hsin into the Mechanism Dominion state.\n\nMechanism Dominion\nThe Mechanism Dominion state lasts 13s.\nWhile this state is active, Basic Attack - Illumining Form is replaced with Basic Attack - Illumining Form: Pillars Aligned, and Dodge Counter - Illumining Form is replaced with Dodge Counter - Illumining Form: Pillars Aligned.\nWhen Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned hits a target, Illumining Heart is consumed if Hsin is the active Resonator.\nExiting Mechanism Dominion clears Illumining Heart.\n\nResonance Mode - Unison\nWhile in Resonance Mode - Unison, Hsin gains the following effects:\n- Hsin can trigger Unison Response, but not in Co-op Mode.\n- After casting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison, the next Resonance Liberation - Formshift grants Hsin Unison for 5s.\n- When Hsin triggers Unison Response, She gains Source Intent, and this cast of Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\nWhen Hsin casts an Intro Skill without triggering Unison Response while holding Source Intent, She consumes Source Intent instead, and the Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\n- The aforementioned effects are removed when Hsin switches Resonance Mode.\n- Casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison sends Hsin directly into the Mechanism Dominion state.\n\nResonance Mode - Electro Flare\nWhile in Resonance Mode - Electro Flare, Hsin gains the following effects:\n- When Hsin enters combat, targets within a certain range do not lose Electro Flare stacks when it's triggered.\n- After Resonators in the team inflict Electro Rage on a target, every 1 stacks of Electro Rage inflicted grants Hsin 1 stacks of Heart of Thunder, stacking up to 100 times, and consumes all Electro Rage stacks from that target. Heart of Thunder is removed when Hsin switches Resonance Mode.\n- At the last stage of Resonance Skill - Heartward by Moon, Hsin actively triggers 1 instance of Electro Flare DMG on the targets. Its DMG Multiplier is equal to 35% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks).\nWhile casting Resonance Skill - Heartward by Moon, switching to another Resonator or ending the skill early removes the above effects.\nSome time after casting Resonance Skill - Heartward by Moon, Hsin consumes all remaining stacks of Heart of Thunder.\nWhen Hsin has at least 50 stacks of Heart of Thunder, Resonance Skill - Illumining Form stagnates nearby targets during the action.\n- After casting Resonance Liberation - Formshift, inflict 5 stacks of Electro Flare on nearby targets within a certain range. It also makes Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned inflict Electro Flare on hit targets, up to 5 times. Casting Resonance Liberation - Formshift again resets this count. Switching Resonance Mode removes it.\nResonance Skill - Illumining Form: Pillars Aligned and Heavy Attack - Illumining Form: Stilling All Horizons inflict 5 stacks of Electro Flare on the target hit. Intro Skill - Illumining Form, Intro Skill - Answering Form, and Heavy Attack - Answering Form: Realm Protector inflict 1 stacks of Electro Flare on the target hit.\n\nUnison\nWhile Hsin is in Resonance Mode - Unison with Unison, switching to another Resonator will remove Hsin's Unison to trigger Hsin's Outro Skill and the incoming Resonator's Intro Skill. If Hsin has full Concerto Energy and Unison at the same time, only Unison is consumed to trigger the effect.\n\nUnison Response\nWhile Hsin is in Resonance Mode - Unison and the active Resonator in the team has Unison, Hsin triggers Unison Response after She is switched in and casts Intro Skill, granting 1 stacks of Unison Boon to all Resonators in the team for 30s.\nHsin can only grant up to 1 stacks of Unison Boon in this way.\n\nUnison Boon\nOnly the Resonators who can trigger Unison Response can gain this effect. Each stack of Unison Boon increases the total DMG dealt by Resonators who can trigger Unison Response in the team by 3%, stacking up to 2 times.\n\nAnswering Heart\nCan hold up to 100 points of Answering Heart.\nWhile in Answering Form, when Normal Attack - Answering Form, Resonance Skill - Answering Form, Intro Skill - Answering Form, or Intro Skill - Answering Form: Manifold Unison hits a target, Hsin gains Answering Heart if She is the active Resonator.\nCasting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison grants 60 points of Answering Heart.\n\nIllumining Heart\nCan hold up to 300 points of Illumining Heart.\nWhile in Illumining Form and not in the Mechanism Dominion state, when Normal Attack - Illumining Form, Resonance Skill - Illumining Form, or Intro Skill - Illumining Form hits a target, Hsin gains Illumining Heart if She is the active Resonator.\n- While in Resonance Mode - Unison, casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison directly sends Hsin into the Mechanism Dominion state and grants 300 points of Illumining Heart.\n- While in Resonance Mode - Electro Flare, after casting Resonance Liberation - Formshift, when the Modular Heartlock generated by Basic Attack - Illumining Form Stage 1 is collapsed by Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form, additionally gain 150 points of Illumining Heart if Hsin is the active Resonator in Illumining Form but not in the Mechanism Dominion state. This effect can only be triggered once before the next cast of Resonance Liberation - Formshift resets it, and is disabled when switched to the other Resonance Mode.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-resource-heart-of-thunder",
    "characterId": "hsin",
    "name": "Heart of Thunder",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Heart of Thunder",
    "maxValue": 100,
    "ruleSummary": "Forms Born of Heart\nWhile in Answering Form, Hsin can gain and consume Answering Heart.\nWhile in Illumining Form, Hsin can gain and consume Illumining Heart.\n\nHeavy Attack - Answering Form: Realm Wanderer\nWhile in Answering Form, when Hsin's Answering Heart reaches 100 points, Heavy Attack - Answering Form is replaced with Heavy Attack - Answering Form: Realm Wanderer.\nHold Normal Attack to cast the skill at the cost of STA and 100 points of Answering Heart. Hsin is immune to interruption during the action, and deals Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Answering Form: Realm Wanderer grants Hsin Resolution of Wishes. This Heavy Attack - Answering Form: Realm Wanderer consumes Resolution of Wishes to become Heavy Attack - Answering Form: Realm Protector, dealing greater DMG. Resolution of Wishes can only be gained once every 24s.\nWhile casting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector, if Hsin is not in the Heart Manifest state, unlock Resonance Liberation - Formshift.\n\nHeavy Attack - Illumining Form: Beholding All Horizons\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 0 during the Mechanism Dominion state, Heavy Attack - Illumining Form is replaced with Heavy Attack - Illumining Form: Beholding All Horizons.\nHold Normal Attack to cast the skill at the cost of STA, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons grants Hsin Law of Heaven. This Heavy Attack - Illumining Form: Beholding All Horizons consumes Law of Heaven to become Heavy Attack - Illumining Form: Stilling All Horizons, dealing greater DMG. Law of Heaven can only be gained once every 24s.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons ends the Mechanism Dominion state and unlocks Resonance Liberation - Pillars Across Heaven.\nCan be cast in mid-air.\n\nResonance Skill - Illumining Form: Pillars Aligned\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 300 points and She is on the ground, Resonance Skill is replaced with Resonance Skill - Illumining Form: Pillars Aligned.\nWhen Hsin is on the ground, press Resonance Skill to deal Electro DMG to surrounding targets.\nCasting Resonance Skill - Illumining Form: Pillars Aligned sends Hsin into the Mechanism Dominion state.\n\nMechanism Dominion\nThe Mechanism Dominion state lasts 13s.\nWhile this state is active, Basic Attack - Illumining Form is replaced with Basic Attack - Illumining Form: Pillars Aligned, and Dodge Counter - Illumining Form is replaced with Dodge Counter - Illumining Form: Pillars Aligned.\nWhen Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned hits a target, Illumining Heart is consumed if Hsin is the active Resonator.\nExiting Mechanism Dominion clears Illumining Heart.\n\nResonance Mode - Unison\nWhile in Resonance Mode - Unison, Hsin gains the following effects:\n- Hsin can trigger Unison Response, but not in Co-op Mode.\n- After casting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison, the next Resonance Liberation - Formshift grants Hsin Unison for 5s.\n- When Hsin triggers Unison Response, She gains Source Intent, and this cast of Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\nWhen Hsin casts an Intro Skill without triggering Unison Response while holding Source Intent, She consumes Source Intent instead, and the Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\n- The aforementioned effects are removed when Hsin switches Resonance Mode.\n- Casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison sends Hsin directly into the Mechanism Dominion state.\n\nResonance Mode - Electro Flare\nWhile in Resonance Mode - Electro Flare, Hsin gains the following effects:\n- When Hsin enters combat, targets within a certain range do not lose Electro Flare stacks when it's triggered.\n- After Resonators in the team inflict Electro Rage on a target, every 1 stacks of Electro Rage inflicted grants Hsin 1 stacks of Heart of Thunder, stacking up to 100 times, and consumes all Electro Rage stacks from that target. Heart of Thunder is removed when Hsin switches Resonance Mode.\n- At the last stage of Resonance Skill - Heartward by Moon, Hsin actively triggers 1 instance of Electro Flare DMG on the targets. Its DMG Multiplier is equal to 35% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks).\nWhile casting Resonance Skill - Heartward by Moon, switching to another Resonator or ending the skill early removes the above effects.\nSome time after casting Resonance Skill - Heartward by Moon, Hsin consumes all remaining stacks of Heart of Thunder.\nWhen Hsin has at least 50 stacks of Heart of Thunder, Resonance Skill - Illumining Form stagnates nearby targets during the action.\n- After casting Resonance Liberation - Formshift, inflict 5 stacks of Electro Flare on nearby targets within a certain range. It also makes Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned inflict Electro Flare on hit targets, up to 5 times. Casting Resonance Liberation - Formshift again resets this count. Switching Resonance Mode removes it.\nResonance Skill - Illumining Form: Pillars Aligned and Heavy Attack - Illumining Form: Stilling All Horizons inflict 5 stacks of Electro Flare on the target hit. Intro Skill - Illumining Form, Intro Skill - Answering Form, and Heavy Attack - Answering Form: Realm Protector inflict 1 stacks of Electro Flare on the target hit.\n\nUnison\nWhile Hsin is in Resonance Mode - Unison with Unison, switching to another Resonator will remove Hsin's Unison to trigger Hsin's Outro Skill and the incoming Resonator's Intro Skill. If Hsin has full Concerto Energy and Unison at the same time, only Unison is consumed to trigger the effect.\n\nUnison Response\nWhile Hsin is in Resonance Mode - Unison and the active Resonator in the team has Unison, Hsin triggers Unison Response after She is switched in and casts Intro Skill, granting 1 stacks of Unison Boon to all Resonators in the team for 30s.\nHsin can only grant up to 1 stacks of Unison Boon in this way.\n\nUnison Boon\nOnly the Resonators who can trigger Unison Response can gain this effect. Each stack of Unison Boon increases the total DMG dealt by Resonators who can trigger Unison Response in the team by 3%, stacking up to 2 times.\n\nAnswering Heart\nCan hold up to 100 points of Answering Heart.\nWhile in Answering Form, when Normal Attack - Answering Form, Resonance Skill - Answering Form, Intro Skill - Answering Form, or Intro Skill - Answering Form: Manifold Unison hits a target, Hsin gains Answering Heart if She is the active Resonator.\nCasting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison grants 60 points of Answering Heart.\n\nIllumining Heart\nCan hold up to 300 points of Illumining Heart.\nWhile in Illumining Form and not in the Mechanism Dominion state, when Normal Attack - Illumining Form, Resonance Skill - Illumining Form, or Intro Skill - Illumining Form hits a target, Hsin gains Illumining Heart if She is the active Resonator.\n- While in Resonance Mode - Unison, casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison directly sends Hsin into the Mechanism Dominion state and grants 300 points of Illumining Heart.\n- While in Resonance Mode - Electro Flare, after casting Resonance Liberation - Formshift, when the Modular Heartlock generated by Basic Attack - Illumining Form Stage 1 is collapsed by Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form, additionally gain 150 points of Illumining Heart if Hsin is the active Resonator in Illumining Form but not in the Mechanism Dominion state. This effect can only be triggered once before the next cast of Resonance Liberation - Formshift resets it, and is disabled when switched to the other Resonance Mode.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-resource-edict",
    "characterId": "hsin",
    "name": "Edict",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Edict",
    "maxValue": 21,
    "ruleSummary": "Formshift\nCasting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector unlocks Formshift.\nCast Formshift to unfurl the Manifold Sanctum. Hsin switches to Illumining Form, unlocking a new set of combat abilities, and enters the Heart Manifest state.\nCan be cast in mid-air close to the ground.\nWhile in Illumining Form, engaging in quest dialogue, performing an environmental interaction with an animation, or using a Utility switches Hsin back to Answering Form to perform the corresponding action.\nWhile in Illumining Form, Hsin can walk on the surface of water, and will continuously consume STA in deep water areas. In Walking Mode, Hsin in Illumining Form can step off a cliff into the air and walk slowly in mid-air, continuously consuming STA in this state. Hsin cannot restore STA while in Illumining Form and in mid-air.\n\nPillars Across Heaven\nAfter casting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons, when in Illumining Form with full Resonance Energy, Pillars Across Heaven becomes available.\nCast Pillars Across Heaven to bring the Manifold Sanctum crashing down, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCan be cast in mid-air close to the ground.\nHsin returns to Answering Form and exits the Heart Manifest state.\n\nEdict\nCasting Formshift grants Hsin 21 stacks of Edict for 45s. The effect cannot exceed 21 stacks and all stacks are removed when the duration ends.\nAfter a Resonator on the field deals DMG, Hsin automatically consumes Edict in the following 3s to trigger the following effect up to once per second. Retriggering the effect resets the duration:\n- When Edict is consumed, summon a Soaring Pillar from the Manifold Sanctum as a Coordinated Attack to strike the target once, dealing Electro DMG. \n- Edict can be automatically consumed up to 1 stack per second.\n- Damage dealt by Soaring Pillar does not trigger this effect.\n- When Hsin is knocked out, all Edict stacks are removed.\n\nHeart Manifest\nIncreases Hsin's resistance to interruption for 45s.\nEntering the Heart Manifest state resets Hsin's Illumining Form.\nWhile in the Heart Manifest state and in Illumining Form, if Pillars Across Heaven is locked, press Resonance Liberation to have Hsin cast Invoked Form: Answering. While in Answering Form, press Resonance Liberation to have Hsin cast Invoked Form: Illumining.\nBesides, if Hsin is still in Illumining Form after exiting Heart Manifest, and Pillars Across Heaven is locked, press Resonance Liberation to have Hsin cast Invoked Form: Answering.\n\nInvoked Form: Answering\nHsin temporarily reverts to Answering Form. When this skill is cast, if Hsin is on the ground, She casts Basic Attack - Answering Form Stage 2; if She is in mid-air, She casts Mid-air Attack - Answering Form.\n\nInvoked Form: Illumining\nHsin turns back into Illumining Form. When this skill is cast, if Hsin is on the ground, She casts Upward Cut - Illumining Form; if She is in mid-air, She casts Mid-air Attack - Illumining Form.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-resource-unison-boon-base",
    "characterId": "hsin",
    "name": "Unison Boon (base)",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Unison Boon (base)",
    "maxValue": 2,
    "ruleSummary": "Forms Born of Heart\nWhile in Answering Form, Hsin can gain and consume Answering Heart.\nWhile in Illumining Form, Hsin can gain and consume Illumining Heart.\n\nHeavy Attack - Answering Form: Realm Wanderer\nWhile in Answering Form, when Hsin's Answering Heart reaches 100 points, Heavy Attack - Answering Form is replaced with Heavy Attack - Answering Form: Realm Wanderer.\nHold Normal Attack to cast the skill at the cost of STA and 100 points of Answering Heart. Hsin is immune to interruption during the action, and deals Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Answering Form: Realm Wanderer grants Hsin Resolution of Wishes. This Heavy Attack - Answering Form: Realm Wanderer consumes Resolution of Wishes to become Heavy Attack - Answering Form: Realm Protector, dealing greater DMG. Resolution of Wishes can only be gained once every 24s.\nWhile casting Heavy Attack - Answering Form: Realm Wanderer or Heavy Attack - Answering Form: Realm Protector, if Hsin is not in the Heart Manifest state, unlock Resonance Liberation - Formshift.\n\nHeavy Attack - Illumining Form: Beholding All Horizons\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 0 during the Mechanism Dominion state, Heavy Attack - Illumining Form is replaced with Heavy Attack - Illumining Form: Beholding All Horizons.\nHold Normal Attack to cast the skill at the cost of STA, dealing Electro DMG to the target, considered Resonance Skill DMG.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons grants Hsin Law of Heaven. This Heavy Attack - Illumining Form: Beholding All Horizons consumes Law of Heaven to become Heavy Attack - Illumining Form: Stilling All Horizons, dealing greater DMG. Law of Heaven can only be gained once every 24s.\nCasting Heavy Attack - Illumining Form: Beholding All Horizons or Heavy Attack - Illumining Form: Stilling All Horizons ends the Mechanism Dominion state and unlocks Resonance Liberation - Pillars Across Heaven.\nCan be cast in mid-air.\n\nResonance Skill - Illumining Form: Pillars Aligned\nWhile in Illumining Form, when Hsin's Illumining Heart reaches 300 points and She is on the ground, Resonance Skill is replaced with Resonance Skill - Illumining Form: Pillars Aligned.\nWhen Hsin is on the ground, press Resonance Skill to deal Electro DMG to surrounding targets.\nCasting Resonance Skill - Illumining Form: Pillars Aligned sends Hsin into the Mechanism Dominion state.\n\nMechanism Dominion\nThe Mechanism Dominion state lasts 13s.\nWhile this state is active, Basic Attack - Illumining Form is replaced with Basic Attack - Illumining Form: Pillars Aligned, and Dodge Counter - Illumining Form is replaced with Dodge Counter - Illumining Form: Pillars Aligned.\nWhen Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned hits a target, Illumining Heart is consumed if Hsin is the active Resonator.\nExiting Mechanism Dominion clears Illumining Heart.\n\nResonance Mode - Unison\nWhile in Resonance Mode - Unison, Hsin gains the following effects:\n- Hsin can trigger Unison Response, but not in Co-op Mode.\n- After casting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison, the next Resonance Liberation - Formshift grants Hsin Unison for 5s.\n- When Hsin triggers Unison Response, She gains Source Intent, and this cast of Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\nWhen Hsin casts an Intro Skill without triggering Unison Response while holding Source Intent, She consumes Source Intent instead, and the Intro Skill is replaced with Intro Skill - Manifold Unison, dealing greater DMG.\n- The aforementioned effects are removed when Hsin switches Resonance Mode.\n- Casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison sends Hsin directly into the Mechanism Dominion state.\n\nResonance Mode - Electro Flare\nWhile in Resonance Mode - Electro Flare, Hsin gains the following effects:\n- When Hsin enters combat, targets within a certain range do not lose Electro Flare stacks when it's triggered.\n- After Resonators in the team inflict Electro Rage on a target, every 1 stacks of Electro Rage inflicted grants Hsin 1 stacks of Heart of Thunder, stacking up to 100 times, and consumes all Electro Rage stacks from that target. Heart of Thunder is removed when Hsin switches Resonance Mode.\n- At the last stage of Resonance Skill - Heartward by Moon, Hsin actively triggers 1 instance of Electro Flare DMG on the targets. Its DMG Multiplier is equal to 35% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks).\nWhile casting Resonance Skill - Heartward by Moon, switching to another Resonator or ending the skill early removes the above effects.\nSome time after casting Resonance Skill - Heartward by Moon, Hsin consumes all remaining stacks of Heart of Thunder.\nWhen Hsin has at least 50 stacks of Heart of Thunder, Resonance Skill - Illumining Form stagnates nearby targets during the action.\n- After casting Resonance Liberation - Formshift, inflict 5 stacks of Electro Flare on nearby targets within a certain range. It also makes Basic Attack - Illumining Form: Pillars Aligned or Dodge Counter - Illumining Form: Pillars Aligned inflict Electro Flare on hit targets, up to 5 times. Casting Resonance Liberation - Formshift again resets this count. Switching Resonance Mode removes it.\nResonance Skill - Illumining Form: Pillars Aligned and Heavy Attack - Illumining Form: Stilling All Horizons inflict 5 stacks of Electro Flare on the target hit. Intro Skill - Illumining Form, Intro Skill - Answering Form, and Heavy Attack - Answering Form: Realm Protector inflict 1 stacks of Electro Flare on the target hit.\n\nUnison\nWhile Hsin is in Resonance Mode - Unison with Unison, switching to another Resonator will remove Hsin's Unison to trigger Hsin's Outro Skill and the incoming Resonator's Intro Skill. If Hsin has full Concerto Energy and Unison at the same time, only Unison is consumed to trigger the effect.\n\nUnison Response\nWhile Hsin is in Resonance Mode - Unison and the active Resonator in the team has Unison, Hsin triggers Unison Response after She is switched in and casts Intro Skill, granting 1 stacks of Unison Boon to all Resonators in the team for 30s.\nHsin can only grant up to 1 stacks of Unison Boon in this way.\n\nUnison Boon\nOnly the Resonators who can trigger Unison Response can gain this effect. Each stack of Unison Boon increases the total DMG dealt by Resonators who can trigger Unison Response in the team by 3%, stacking up to 2 times.\n\nAnswering Heart\nCan hold up to 100 points of Answering Heart.\nWhile in Answering Form, when Normal Attack - Answering Form, Resonance Skill - Answering Form, Intro Skill - Answering Form, or Intro Skill - Answering Form: Manifold Unison hits a target, Hsin gains Answering Heart if She is the active Resonator.\nCasting Intro Skill - Answering Form or Intro Skill - Answering Form: Manifold Unison grants 60 points of Answering Heart.\n\nIllumining Heart\nCan hold up to 300 points of Illumining Heart.\nWhile in Illumining Form and not in the Mechanism Dominion state, when Normal Attack - Illumining Form, Resonance Skill - Illumining Form, or Intro Skill - Illumining Form hits a target, Hsin gains Illumining Heart if She is the active Resonator.\n- While in Resonance Mode - Unison, casting Intro Skill - Illumining Form or Intro Skill - Illumining Form: Manifold Unison directly sends Hsin into the Mechanism Dominion state and grants 300 points of Illumining Heart.\n- While in Resonance Mode - Electro Flare, after casting Resonance Liberation - Formshift, when the Modular Heartlock generated by Basic Attack - Illumining Form Stage 1 is collapsed by Basic Attack - Illumining Form Stage 2, Heavy Attack - Illumining Form, Dodge Counter - Illumining Form, or Resonance Skill - Illumining Form, additionally gain 150 points of Illumining Heart if Hsin is the active Resonator in Illumining Form but not in the Mechanism Dominion state. This effect can only be triggered once before the next cast of Resonance Liberation - Formshift resets it, and is disabled when switched to the other Resonance Mode.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-resource-thunderglow",
    "characterId": "hsin",
    "name": "Thunderglow",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Thunderglow",
    "maxValue": 10,
    "ruleSummary": "While in Resonance Mode - Unison, the maximum stacks of the Unison Boon effect on Resonators in the team are increased by 1. When a Resonator in the team triggers Unison Response, all Resonators in the team gain 1 stacks of Unison Boon for 30s. This effect does not stack.\n\nWhile in Resonance Mode - Electro Flare and Hsin is not in the Heart Manifest state, after Resonators in the team other than Hsin inflict Electro Flare on a target, every 1 stack of Electro Flare inflicted grants Hisn 1 stack of Thunderglow, stacking up to 10 times.\nWhile Hsin is in the Heart Manifest state, when targets within a certain range have 0 stacks of Electro Flare, inflict 1 stack of Electro Flare on the targets. If Thunderglow on Hsin reaches the stack limit, Hsin also inflicts Fleeting Thunder on the targets:\n- When Hsin inflicts Fleeting Thunder on the target, She also inflicts Electro Flare on the target to the stack limit, up to 16 stacks of Electro Flare.\n- When Fleeting Thunder is active, if the maximum stacks of Electro Flare on the target is increased, Hsin will inflict Electro Flare on the target to the stack limit again, up to 16 stacks of Electro Flare.\n- Fleeting Thunder will be removed when the target leaves the designated range around Hsin.\nExiting the Heart Manifest state or switching Resonance Mode removes the aforementioned effects.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "hsin-sequence-1",
    "characterId": "hsin",
    "name": "A Boat to Cross the Rising Tide",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 1,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Casting Resonance Liberation - Formshift grants Hsin 2 stacks of Radiance Ward, stacking up to 2 times. Switching to Answering Form clears all stacks. When Hsin takes DMG from an enemy target's attack, 1 stack of Radiance Ward can be consumed to make Her immune to interruption and reduce DMG taken by 60% for 1s. This effect can be triggered once every 1s.\n\nWhile in Resonance Mode - Unison:\nThe DMG Multipliers of Intro Skill - Answering Form: Manifold Unison and Intro Skill - Illumining Form: Manifold Unison are increased by 15%, and each stack of Unison Boon additionally increases the DMG Multipliers of Intro Skill - Answering Form: Manifold Unison and Intro Skill - Illumining Form: Manifold Unison by 10%, up to a total of 4 stacks.\n\nWhile in Resonance Mode - Electro Flare:\nWhen Hsin enters combat, if Heart of Thunder is below 50 stacks, it is increased to 50 stacks, triggered once every 12s.\nThe DMG Multiplier of the Electro Flare DMG triggered by Resonance Skill - Heartward by Moon is increased to 42% x (the number of Heart of Thunder stacks on Hsin) x (the Electro Flare DMG Multiplier corresponding to the target's current Electro Flare stacks)."
  },
  {
    "factId": "hsin-sequence-2",
    "characterId": "hsin",
    "name": "To Wake Is to Wonder What I Am",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 2,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The DMG Multipliers of Heavy Attack - Answering Form: Realm Wanderer and Heavy Attack - Answering Form: Realm Protector are increased by 60%.\nThe DMG Multipliers of Heavy Attack - Illumining Form: Beholding All Horizons and Heavy Attack - Illumining Form: Stilling All Horizons are increased by 60%.\n\nWhen Hsin enters combat, reset the Cooldowns for Hsin to gain Resolution of Wishes and Law of Heaven, and restore 100 additional points of Answering Heart. This effect can be triggered once every 12s."
  },
  {
    "factId": "hsin-sequence-3",
    "characterId": "hsin",
    "name": "A Dream of Return Among the Hills",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 3,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The DMG Multiplier of Resonance Liberation - Pillars Across Heaven is increased by 70%.\n\nWhile in Resonance Mode - Unison:\nThe Crit. DMG of Resonance Liberation - Pillars Across Heaven is increased by 20%, and each stack of Unison Boon additionally increases its Crit. DMG by 15%, up to a total of 4 stacks.\n\nWhile in Resonance Mode - Electro Flare:\nWhen the last stage of Resonance Liberation - Pillars Across Heaven hits a target inflicted with Electro Flare, it triggers 1 instance of Electro Flare DMG, with its DMG Multiplier equal to 1500% times the Electro Flare DMG Multiplier corresponding to the current Electro Flare stacks on the target."
  },
  {
    "factId": "hsin-sequence-4",
    "characterId": "hsin",
    "name": "A River of Lanterns, a River of Wishes",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 4,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "All Resonators in the team gain 20% All-Attribute DMG Bonus for 30s when a Resonator in the team triggers any of the following actions:\n- Inflict Electro Flare or Electro Rage on a target.\n- Gain Unison while not having the effect.\n- Trigger Unison Response."
  },
  {
    "factId": "hsin-sequence-5",
    "characterId": "hsin",
    "name": "Forms Turn as the Heart Wills",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 5,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "While in Illumining Form, DMG taken by Hsin is reduced by 20%.\nWhen Hsin takes a fatal blow, She will not be knocked out, but instead restores 100% of Max HP and becomes immune to DMG and interruption for 1s. This effect can be triggered once every 10 minutes."
  },
  {
    "factId": "hsin-sequence-6",
    "characterId": "hsin",
    "name": "The Moon Owes Its Light to the Living",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 6,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Targets take 40% more Resonance Skill DMG from Hsin.\n\nResonance Skill DMG dealt by Hsin ignores 20% of the target's DEF.\n\nWhile in Resonance Mode - Unison:\nThe maximum stacks of the Unison Boon effect on Resonators in the team are additionally increased by 1. When a Resonator in the team triggers Unison Response, all Resonators in the team additionally gain 1 stacks of Unison Boon for 30s. This effect does not stack.\n\nWhile in Resonance Mode - Electro Flare:\nWhile in combat, Electro Flare DMG taken by targets within a certain range around Hsin can be Critical, with Crit. Rate fixed at 80% and Crit. DMG fixed at 230%."
  },
  {
    "factId": "jingran-skill-1005901-rules",
    "characterId": "jingran",
    "name": "Edge of Life and Death",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005901; exact prerequisites are in effectSummary.",
    "effectSummary": "Basic Attack - Drink Soul\nWhile in the Yin Vessel state, perform up to 4 consecutive attacks, dealing Fusion DMG.\nCasting Basic Attack - Drink Soul Stage 3 restores 50 points of Qi, dealing Heavy Attack DMG.\nCasting Basic Attack - Drink Soul Stage 4 restores 50 points of Qi, dealing Heavy Attack DMG.\n\nBasic Attack - Devil's Bane\nWhile in the Yang Font state, perform up to 4 consecutive attacks, dealing Fusion DMG.\nCasting Basic Attack - Devil's Bane Stage 3 restores 50 points of Qi, dealing Heavy Attack DMG.\nCasting Basic Attack - Devil's Bane Stage 4 restores 50 points of Qi, dealing Heavy Attack DMG.\n\nMid-air Attack\nConsume STA to perform a Plunging Attack in the air, dealing Fusion DMG.\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nWhile in the Yang Font state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nDodge Counter - Nether Dive\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after a successful Dodge to attack the target, dealing Fusion DMG.\nCasting Dodge Counter - Nether Dive restores 100 points of Qi, dealing Heavy Attack DMG.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 4.\n\nDodge Counter - Light Watch\nWhile in the Yang Font state, press or hold Normal Attack shortly after a successful Dodge to attack the target, dealing Fusion DMG.\nCasting Dodge Counter - Light Watch restores 100 points of Qi, dealing Heavy Attack DMG.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 4.\n\nShadow Step\nWhile in combat and on the ground, press Dodge with directional input to cast Shadow Step, dealing a fixed amount of Fusion DMG, considered Basic Attack DMG. This instance of damage is not affected by any DMG Bonus effects. A successful Dodge may be triggered within a certain time during the action of this skill.\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nWhile in the Yang Font state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-damage-1212001",
    "characterId": "jingran",
    "name": "Basic Attack - Drink Soul Stage 1 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212001; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212001."
    ],
    "motionValueCurve": [
      0.225,
      0.24350000000000002,
      0.2619,
      0.2878,
      0.3062,
      0.3274,
      0.35700000000000004,
      0.3865,
      0.41600000000000004,
      0.4474
    ]
  },
  {
    "factId": "jingran-damage-1212002",
    "characterId": "jingran",
    "name": "Basic Attack - Drink Soul Stage 2 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212002; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212002."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.1875,
          0.2029,
          0.2183,
          0.2398,
          0.2552,
          0.2729,
          0.2975,
          0.3221,
          0.3467,
          0.3728
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.1875,
          0.2029,
          0.2183,
          0.2398,
          0.2552,
          0.2729,
          0.2975,
          0.3221,
          0.3467,
          0.3728
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212003",
    "characterId": "jingran",
    "name": "Basic Attack - Drink Soul Stage 3 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212003; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 4,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212003."
    ],
    "motionValueCurve": [
      0.1375,
      0.14880000000000002,
      0.16,
      0.17579999999999998,
      0.18710000000000002,
      0.2,
      0.2181,
      0.2361,
      0.2541,
      0.2733
    ]
  },
  {
    "factId": "jingran-damage-1212004",
    "characterId": "jingran",
    "name": "Basic Attack - Drink Soul Stage 4 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212004; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212004."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.2311,
          0.2501,
          0.26899999999999996,
          0.2955,
          0.3145,
          0.33630000000000004,
          0.3666,
          0.3969,
          0.42719999999999997,
          0.4595
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.2311,
          0.2501,
          0.26899999999999996,
          0.2955,
          0.3145,
          0.33630000000000004,
          0.3666,
          0.3969,
          0.42719999999999997,
          0.4595
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.15410000000000001,
          0.16670000000000001,
          0.1794,
          0.19699999999999998,
          0.2097,
          0.2242,
          0.2444,
          0.2646,
          0.2848,
          0.3063
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.15410000000000001,
          0.16670000000000001,
          0.1794,
          0.19699999999999998,
          0.2097,
          0.2242,
          0.2444,
          0.2646,
          0.2848,
          0.3063
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212005",
    "characterId": "jingran",
    "name": "Basic Attack - Devil's Bane Stage 1 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212005; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212005."
    ],
    "motionValueCurve": [
      0.2003,
      0.2167,
      0.23309999999999997,
      0.2561,
      0.2726,
      0.2914,
      0.3177,
      0.344,
      0.3703,
      0.3982
    ]
  },
  {
    "factId": "jingran-damage-1212006",
    "characterId": "jingran",
    "name": "Basic Attack - Devil's Bane Stage 2 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212006; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212006."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.3002,
          0.3248,
          0.3494,
          0.3839,
          0.40850000000000003,
          0.4368,
          0.47619999999999996,
          0.5156000000000001,
          0.5549000000000001,
          0.5968
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.20010000000000003,
          0.21660000000000001,
          0.233,
          0.2559,
          0.2723,
          0.2912,
          0.3175,
          0.34369999999999995,
          0.37,
          0.3979
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212007",
    "characterId": "jingran",
    "name": "Basic Attack - Devil's Bane Stage 3 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212007; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212007."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.2401,
          0.25980000000000003,
          0.27949999999999997,
          0.3071,
          0.3267,
          0.3494,
          0.3809,
          0.41240000000000004,
          0.4439,
          0.47729999999999995
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.2401,
          0.25980000000000003,
          0.27949999999999997,
          0.3071,
          0.3267,
          0.3494,
          0.3809,
          0.41240000000000004,
          0.4439,
          0.47729999999999995
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3201,
          0.3464,
          0.3726,
          0.4094,
          0.43560000000000004,
          0.4658,
          0.5078,
          0.5498,
          0.5918,
          0.6364
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212008",
    "characterId": "jingran",
    "name": "Basic Attack - Devil's Bane Stage 4 DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212008; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212008."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.4374,
          0.4732,
          0.5091,
          0.5593,
          0.5952000000000001,
          0.6364,
          0.6938,
          0.7512000000000001,
          0.8085,
          0.8695
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0625,
          0.0676,
          0.0728,
          0.0799,
          0.0851,
          0.091,
          0.0992,
          0.1074,
          0.1155,
          0.1243
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "jingran-damage-1212009",
    "characterId": "jingran",
    "name": "Mid-air Attack DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "actionKind": "BASIC",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212009; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212009."
    ],
    "motionValueCurve": [
      0.465,
      0.5032,
      0.5413,
      0.5947,
      0.6328,
      0.6767,
      0.7376999999999999,
      0.7987000000000001,
      0.8597,
      0.9245
    ]
  },
  {
    "factId": "jingran-damage-1212010",
    "characterId": "jingran",
    "name": "Dodge Counter - Nether Dive DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "DODGE_COUNTER",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212010; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 4,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212010."
    ],
    "motionValueCurve": [
      0.25,
      0.2705,
      0.29100000000000004,
      0.3197,
      0.34020000000000006,
      0.36369999999999997,
      0.39649999999999996,
      0.4293,
      0.4621,
      0.49700000000000005
    ]
  },
  {
    "factId": "jingran-damage-1212011",
    "characterId": "jingran",
    "name": "Dodge Counter - Light Watch DMG",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "DODGE_COUNTER",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005901, description row 1212011; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212011."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.3751,
          0.40590000000000004,
          0.4366,
          0.4797,
          0.5105,
          0.5458,
          0.595,
          0.6442,
          0.6934999999999999,
          0.7456999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.3751,
          0.40590000000000004,
          0.4366,
          0.4797,
          0.5105,
          0.5458,
          0.595,
          0.6442,
          0.6934999999999999,
          0.7456999999999999
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.5001,
          0.5412,
          0.5821999999999999,
          0.6396000000000001,
          0.6806,
          0.7277,
          0.7934,
          0.8590000000000001,
          0.9246,
          0.9943000000000001
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-shadow-step-flat-1",
    "characterId": "jingran",
    "name": "Shadow Step — flat component 1",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "DODGE_COUNTER",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "scalingStat": "FIXED",
    "motionValue": null,
    "sourceFixedFlatDamage": 30,
    "motionValueContext": "Source row 1212028: fixed 30+25 damage; separate listed components, unaffected by all DMG Bonus effects.",
    "hitCount": 1,
    "notes": [
      "Do not apply ordinary Basic DMG Bonus or combine source components into an invented stat multiplier."
    ]
  },
  {
    "factId": "jingran-shadow-step-flat-2",
    "characterId": "jingran",
    "name": "Shadow Step — flat component 2",
    "section": "BASIC_ATTACK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "DODGE_COUNTER",
    "actionRole": "DAMAGE",
    "damageClass": "BASIC",
    "scalingStat": "FIXED",
    "motionValue": null,
    "sourceFixedFlatDamage": 25,
    "motionValueContext": "Source row 1212028: fixed 30+25 damage; separate listed components, unaffected by all DMG Bonus effects.",
    "hitCount": 1,
    "notes": [
      "Do not apply ordinary Basic DMG Bonus or combine source components into an invented stat multiplier."
    ]
  },
  {
    "factId": "jingran-skill-1005902-rules",
    "characterId": "jingran",
    "name": "Malevolent Encounter",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005902; exact prerequisites are in effectSummary.",
    "effectSummary": "Resonance Skill - Encroaching Yin\nWhile in the Yin Vessel state, Resonance Skill - Encroaching Yin is available, which deals Fusion DMG.\nResonance Skill - Encroaching Yin can be cast in mid-air.\n\nResonance Skill - Scorching Yang\nWhile in the Yang Font state, Resonance Skill - Scorching Yang is available, which deals Fusion DMG.\nResonance Skill - Scorching Yang can be cast in mid-air.\n\nCleanse of Impurity\nCasting Resonance Skill - Encroaching Yin or Resonance Skill - Scorching Yang grants Cleanse of Impurity for 4s or until one of the following conditions is met:\n- Switching to another Resonator.\n- Switching to the Yin Vessel or Yang Font state.\n- Casting Resonance Skill - Netherworld Traverse or Resonance Skill - Afterlife's Guide.\n\nResonance Skill - Netherworld Traverse\nWhile in the Yin Vessel state with Cleanse of Impurity, press or hold Normal Attack in mid-air to cast Resonance Skill - Netherworld Traverse, dealing Fusion DMG, considered Heavy Attack DMG.\nCasting Resonance Skill - Netherworld Traverse restores 100 points of Qi.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\n\nResonance Skill - Afterlife's Guide\nWhile in the Yang Font state with Cleanse of Impurity, press or hold Normal Attack in mid-air to cast Resonance Skill - Afterlife's Guide, dealing Fusion DMG, considered Heavy Attack DMG.\nCasting Resonance Skill - Afterlife's Guide restores 100 points of Qi.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-damage-1212013",
    "characterId": "jingran",
    "name": "Encroaching Yin DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005902, description row 1212013; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212013."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.33,
          0.35710000000000003,
          0.38420000000000004,
          0.42210000000000003,
          0.44909999999999994,
          0.4802,
          0.5235,
          0.5668,
          0.6101,
          0.6561
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.165,
          0.17859999999999998,
          0.19210000000000002,
          0.21109999999999998,
          0.22460000000000002,
          0.2401,
          0.2618,
          0.2834,
          0.30510000000000004,
          0.3281
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "jingran-damage-1212014",
    "characterId": "jingran",
    "name": "Netherworld Traverse DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005902, description row 1212014; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212014."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.26,
          0.2813,
          0.30260000000000004,
          0.3325,
          0.3538,
          0.37829999999999997,
          0.41240000000000004,
          0.4465,
          0.4806,
          0.5169
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.13,
          0.1407,
          0.15130000000000002,
          0.1663,
          0.1769,
          0.1892,
          0.20620000000000002,
          0.22329999999999997,
          0.2403,
          0.2585
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.195,
          0.21100000000000002,
          0.22699999999999998,
          0.2494,
          0.26539999999999997,
          0.2837,
          0.3093,
          0.33490000000000003,
          0.3605,
          0.38770000000000004
        ],
        "hitCount": 4
      }
    ]
  },
  {
    "factId": "jingran-damage-1212015",
    "characterId": "jingran",
    "name": "Scorching Yang DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "SKILL",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005902, description row 1212015; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212015."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.33,
          0.35710000000000003,
          0.38420000000000004,
          0.42210000000000003,
          0.44909999999999994,
          0.4802,
          0.5235,
          0.5668,
          0.6101,
          0.6561
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.165,
          0.17859999999999998,
          0.19210000000000002,
          0.21109999999999998,
          0.22460000000000002,
          0.2401,
          0.2618,
          0.2834,
          0.30510000000000004,
          0.3281
        ],
        "hitCount": 3
      }
    ]
  },
  {
    "factId": "jingran-damage-1212016",
    "characterId": "jingran",
    "name": "Afterlife's Guide DMG",
    "section": "RESONANCE_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "SKILL",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005902, description row 1212016; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212016."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.33140000000000003,
          0.35850000000000004,
          0.3857,
          0.42369999999999997,
          0.4509,
          0.48210000000000003,
          0.5256000000000001,
          0.5690999999999999,
          0.6125,
          0.6587000000000001
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.33140000000000003,
          0.35850000000000004,
          0.3857,
          0.42369999999999997,
          0.4509,
          0.48210000000000003,
          0.5256000000000001,
          0.5690999999999999,
          0.6125,
          0.6587000000000001
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.6627,
          0.7170000000000001,
          0.7713,
          0.8473999999999999,
          0.9018,
          0.9642000000000001,
          1.0512000000000001,
          1.1381000000000001,
          1.225,
          1.3174000000000001
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-skill-1005903-rules",
    "characterId": "jingran",
    "name": "Burial of Thousand Souls",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005903; exact prerequisites are in effectSummary.",
    "effectSummary": "Resonance Liberation - Burial of Thousand Souls can be cast in mid-air close to the ground.\nAttack the target, dealing Fusion DMG, considered Heavy Attack DMG, and granting 100 points of Fire of Life.\nGain the following effects after casting this skill:\n- If Jingran's current HP is above 50% of the Max HP, reduce his current HP to 50% of the Max HP.\n- Gain 200 points of Qi.\n- Gain 3 stacks of Wayfarer's Mark.\n- Enter the Yinghuo state for 15s.\n\nWayfarer's Mark\nMax 3 stacks.\nCasting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander restores 200 points of Qi and reduces 1 stacks of Wayfarer's Mark. This effect lasts for 15s.\n\nYinghuo\n- Dealing damage with Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander summons Chimei Wangliang to attack the targets, which deals Fusion DMG, considered Heavy Attack DMG. This effect can be triggered once per Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander.\n- All Fire of Life will be removed as Yinghuo ends.\n",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-damage-1212019",
    "characterId": "jingran",
    "name": "Burial of Thousand Souls DMG",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "LIBERATION",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005903, description row 1212019; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 8,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212019."
    ],
    "motionValueCurve": [
      0.4686,
      0.507,
      0.5454,
      0.5992000000000001,
      0.6376,
      0.6818000000000001,
      0.7433,
      0.8047,
      0.8662000000000001,
      0.9315000000000001
    ]
  },
  {
    "factId": "jingran-damage-1212020",
    "characterId": "jingran",
    "name": "Chimei Wangliang DMG",
    "section": "RESONANCE_LIBERATION",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "LIBERATION",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005903, description row 1212020; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212020."
    ],
    "motionValueCurve": [
      0.42,
      0.4545,
      0.4889,
      0.5371,
      0.5716,
      0.6112,
      0.6663,
      0.7214,
      0.7765000000000001,
      0.8351000000000001
    ]
  },
  {
    "factId": "jingran-skill-1005904-rules",
    "characterId": "jingran",
    "name": "Hark the Dust",
    "section": "INHERENT_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005904; exact prerequisites are in effectSummary.",
    "effectSummary": "Casting Intro Skill - Question the Tombs, Resonance Skill - Encroaching Yin, or Resonance Skill - Scorching Yang grants Earth Charm.\n\nEarth Charm\nFor 15s, if Jingran is the active Resonator in the team, gain an unstackable Shield equal to 1.6% of Max HP + 700 that lasts for 5s when dealing damage. This effect can be triggered once every 0.5s. This Shield will not be passed on to the incoming Resonator.\nWhile Jingran is in the Yinghuo state, if he is the active Resonator in the team, he gains an unstackable Shield equal to 0.8% of Max HP + 350 that lasts for 5s when dealing damage. This effect can be triggered once every 0.5s. This Shield will not be passed on to the incoming Resonator.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-skill-1005905-rules",
    "characterId": "jingran",
    "name": "Trace the Vestige",
    "section": "INHERENT_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005905; exact prerequisites are in effectSummary.",
    "effectSummary": "Upon entering combat, if Jingran's Ghost Shroud is below 25 points, restore it to 25 points. This effect can be triggered once every 4s.\n\nWhen nearby Resonators in the team other than Jingran gain a Shield, Jingran gains 2 points of Ghost Shroud. This effect can be triggered once every 0.5s.\n\nFixation\n- Upon entering combat, Jingran gains Fixation. This effect can be triggered once every 4s.\n- Casting Outro Skill - Rising Fortune and Ebbing Evil grants Fixation.\n- When nearby Resonators in the team other than Jingran gain a Shield, Jingran gains 15 points of Ghost Shroud and removes Fixation.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-skill-1005906-rules",
    "characterId": "jingran",
    "name": "Question the Tombs",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005906; exact prerequisites are in effectSummary.",
    "effectSummary": "Attack the target, dealing Fusion DMG. Consume and convert all Ghost Shroud to equal stacks of Fortune in Disguise.\nCasting Question the Tombs restores 100 points of Qi.\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nWhile in the Yang Font state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nFortune in Disguise\nMax 50 stacks. Each stack of Fortune in Disguise grants additional Fusion DMG Bonus based on Jingran's Max HP: For every 1000 points of Max HP, Jingran gains 0.05% additional Fusion DMG Bonus for 15s, up to 2.5% for each stack of Fortune in Disguise.\nSwitching to another Resonator ends the effect.\n\nGhost Shroud\n- Max 50 points.\n- When Jingran gains a Shield, he gains 1 points of Ghost Shroud. This effect can be triggered once every 0.5s.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-damage-1212024",
    "characterId": "jingran",
    "name": "Skill DMG",
    "section": "INTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "INTRO",
    "actionKind": "INTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005906, description row 1212024; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": 1,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212024."
    ],
    "motionValueCurve": [
      1,
      1.082,
      1.1640000000000001,
      1.2788,
      1.3608000000000002,
      1.4550999999999998,
      1.5863,
      1.7175,
      1.8487,
      1.9881
    ]
  },
  {
    "factId": "jingran-skill-1005907-rules",
    "characterId": "jingran",
    "name": "Upstream Along Santu",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "SELF",
    "triggerSummary": "Source skill 1005907; exact prerequisites are in effectSummary.",
    "effectSummary": "Qi Modulation\nJingran switches between the Yin Vessel and Yang Font states by casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander. Jingran is in the Yang Font state by default.\n\nHeavy Attack - Soul Raid\nWhen Jingran holds 300 points of Qi while in the Yin Vessel state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Soul Raid, dealing Fusion DMG.\nAfter casting Heavy Attack - Soul Raid, Jingran switches to the Yang Font state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nHeavy Attack - Stardome Meander\nWhen Jingran holds 300 points of Qi while in the Yang Font state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Stardome Meander, dealing Fusion DMG.\nAfter casting Heavy Attack - Stardome Meander, Jingran switches to the Yin Vessel state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nHeavy Attack - Stardome Meander can be cast in mid-air.\n\nQi\nMax 300 points.\n- Casting Basic Attack - Drink Soul Stage 3, Basic Attack - Drink Soul Stage 4, Basic Attack - Devil's Bane Stage 3, or Basic Attack - Devil's Bane Stage 4 restores 50 points of Qi.\n- Casting Dodge Counter - Nether Dive, Dodge Counter - Light Watch, Resonance Skill - Netherworld Traverse, Resonance Skill - Afterlife's Guide, or Intro Skill - Question the Tombs restores 100 points of Qi.\n- Casting Resonance Liberation - Burial of Thousand Souls or casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander with Wayfarer's Mark restores 200 points of Qi.\n\nFire of Life\nMax 100 points.\n- Casting Resonance Liberation - Burial of Thousand Souls grants 100 points of Fire of Life.\n- All Fire of Life is cleared when Yinghuo ends.\nWhile in Yinghuo, if Fire of Life is not at 0 points, casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander consumes 25 points of Fire of Life, and the DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased based on Jingran's Max HP: The DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased for every 1000 points of Jingran's Max HP over 25000. Up to 25000 points of Jingran's Max HP count towards this effect.\n\nNether to Light\n- Jingran's DEF is fixed at 0.\n- Jingran gains Incoming Healing Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 6.2% Incoming Healing Bonus, up to 310%.\n- Jingran gains Fusion DMG Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 1.5% Fusion DMG Bonus, up to 75%.\n\nYang Changes, Yin Unites\nJingran gains additional ATK based on Max HP: For every 1000 points of Max HP, Jingran gains 36 additional ATK, up to 1800.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-damage-1212030",
    "characterId": "jingran",
    "name": "Heavy Attack - Soul Raid DMG Increase per 1,000 Max HP",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "MIXED",
    "motionValue": null,
    "motionValueContext": "Source skill 1005907, description row 1212030; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212030.",
      "Additive increase per 1,000 Max HP over 25,000 while Yinghuo/Fire of Life qualifies, capped at 25,000 qualifying HP. This is not an independently executable HP-scaled hit."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0075,
          0.008100000000000001,
          0.0087,
          0.0095,
          0.0102,
          0.0109,
          0.0118,
          0.0128,
          0.0138,
          0.0148
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.0096,
          0.0104,
          0.011200000000000002,
          0.0123,
          0.013000000000000001,
          0.0139,
          0.0152,
          0.016399999999999998,
          0.0177,
          0.019
        ],
        "hitCount": 3
      },
      {
        "curve": [
          0.0626,
          0.0677,
          0.0729,
          0.0801,
          0.0852,
          0.0911,
          0.0993,
          0.1075,
          0.1157,
          0.1244
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212031",
    "characterId": "jingran",
    "name": "Heavy Attack - Stardome Meander DMG Increase per 1,000 Max HP",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "MIXED",
    "motionValue": null,
    "motionValueContext": "Source skill 1005907, description row 1212031; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212031.",
      "Additive increase per 1,000 Max HP over 25,000 while Yinghuo/Fire of Life qualifies, capped at 25,000 qualifying HP. This is not an independently executable HP-scaled hit."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0109,
          0.0118,
          0.0127,
          0.013999999999999999,
          0.0149,
          0.0159,
          0.0173,
          0.0187,
          0.0202,
          0.0217
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0109,
          0.0118,
          0.0127,
          0.013999999999999999,
          0.0149,
          0.0159,
          0.0173,
          0.0187,
          0.0202,
          0.0217
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0218,
          0.0236,
          0.0254,
          0.0279,
          0.0297,
          0.0317,
          0.0346,
          0.0374,
          0.0403,
          0.0433
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.0653,
          0.0707,
          0.076,
          0.08349999999999999,
          0.0889,
          0.095,
          0.1036,
          0.11220000000000001,
          0.1207,
          0.1298
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212026",
    "characterId": "jingran",
    "name": "Heavy Attack - Soul Raid DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005907, description row 1212026; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212026."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.0825,
          0.08929999999999999,
          0.09609999999999999,
          0.10550000000000001,
          0.11230000000000001,
          0.1201,
          0.1309,
          0.1417,
          0.1525,
          0.16399999999999998
        ],
        "hitCount": 2
      },
      {
        "curve": [
          0.1061,
          0.1148,
          0.1235,
          0.13570000000000002,
          0.1444,
          0.15439999999999998,
          0.16829999999999998,
          0.1822,
          0.1961,
          0.2109
        ],
        "hitCount": 3
      },
      {
        "curve": [
          0.6953,
          0.7523000000000001,
          0.8093,
          0.8891,
          0.9460999999999999,
          1.0116,
          1.1029,
          1.1941,
          1.2853,
          1.3822
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-damage-1212027",
    "characterId": "jingran",
    "name": "Heavy Attack - Stardome Meander DMG",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionRole": "DAMAGE",
    "damageClass": "HEAVY",
    "actionKind": "HEAVY",
    "scalingStat": "ATK",
    "motionValue": null,
    "motionValueContext": "Source skill 1005907, description row 1212027; exact listed per-component multipliers at skill levels 1–10.",
    "hitCount": null,
    "notes": [
      "Source damage classification reviewed separately from skill panel ownership. Source description row 1212027."
    ],
    "motionValueComponents": [
      {
        "curve": [
          0.1209,
          0.1309,
          0.1408,
          0.1547,
          0.1646,
          0.17600000000000002,
          0.1918,
          0.2077,
          0.2236,
          0.2404
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.1209,
          0.1309,
          0.1408,
          0.1547,
          0.1646,
          0.17600000000000002,
          0.1918,
          0.2077,
          0.2236,
          0.2404
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.2418,
          0.26170000000000004,
          0.2815,
          0.3093,
          0.32909999999999995,
          0.3519,
          0.3836,
          0.4153,
          0.4471,
          0.4808
        ],
        "hitCount": 1
      },
      {
        "curve": [
          0.7254,
          0.7848999999999999,
          0.8443999999999999,
          0.9277,
          0.9872,
          1.0556,
          1.1508,
          1.2459,
          1.3411000000000002,
          1.4422
        ],
        "hitCount": 1
      }
    ]
  },
  {
    "factId": "jingran-skill-1005909-rules",
    "characterId": "jingran",
    "name": "Rising Fortune and Ebbing Evil",
    "section": "OUTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "PASSIVE",
    "scope": "OTHER",
    "triggerSummary": "Source skill 1005909; exact prerequisites are in effectSummary.",
    "effectSummary": "Deal Fusion DMG equal to 795% of Jingran's ATK.",
    "durationSeconds": null,
    "maxStacks": null
  },
  {
    "factId": "jingran-outro-source-damage",
    "characterId": "jingran",
    "name": "Rising Fortune and Ebbing Evil — damage",
    "section": "OUTRO_SKILL",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "OUTRO",
    "actionRole": "DAMAGE",
    "damageClass": "OUTRO",
    "scalingStat": "ATK",
    "motionValue": null,
    "sourceFixedMotionValue": 7.95,
    "motionValueContext": "Fixed source Outro coefficient; no skill-level curve.",
    "hitCount": 1
  },
  {
    "factId": "jingran-tune-break-source",
    "characterId": "jingran",
    "name": "Tune Break: Broadblade",
    "section": "TUNE_BREAK",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "PENDING_INTERPRETATION",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "ACTION",
    "actionKind": "TUNE_BREAK",
    "actionRole": "SHARED_SYSTEM_DAMAGE",
    "damageClass": "OTHER",
    "scalingStat": "SHARED_SYSTEM",
    "motionValue": null,
    "motionValueContext": "The source grants Tune Break access; damage belongs to the shared Tune Break system, not a Character skill curve.",
    "hitCount": null,
    "notes": [
      "When the target's Off-Tune Level is full, the Resonator may cast Tune Break on the target.\nWhile in Yin Vessel, press or hold Normal Attack shortly after casting this skill to Basic Attack - Drink Soul Stage 2.\nWhile in Yang Font, press or hold Normal Attack shortly after casting this skill to Basic Attack - Devil's Bane Stage 2."
    ]
  },
  {
    "factId": "jingran-resource-qi",
    "characterId": "jingran",
    "name": "Qi",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Qi",
    "maxValue": 300,
    "ruleSummary": "Qi Modulation\nJingran switches between the Yin Vessel and Yang Font states by casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander. Jingran is in the Yang Font state by default.\n\nHeavy Attack - Soul Raid\nWhen Jingran holds 300 points of Qi while in the Yin Vessel state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Soul Raid, dealing Fusion DMG.\nAfter casting Heavy Attack - Soul Raid, Jingran switches to the Yang Font state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nHeavy Attack - Stardome Meander\nWhen Jingran holds 300 points of Qi while in the Yang Font state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Stardome Meander, dealing Fusion DMG.\nAfter casting Heavy Attack - Stardome Meander, Jingran switches to the Yin Vessel state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nHeavy Attack - Stardome Meander can be cast in mid-air.\n\nQi\nMax 300 points.\n- Casting Basic Attack - Drink Soul Stage 3, Basic Attack - Drink Soul Stage 4, Basic Attack - Devil's Bane Stage 3, or Basic Attack - Devil's Bane Stage 4 restores 50 points of Qi.\n- Casting Dodge Counter - Nether Dive, Dodge Counter - Light Watch, Resonance Skill - Netherworld Traverse, Resonance Skill - Afterlife's Guide, or Intro Skill - Question the Tombs restores 100 points of Qi.\n- Casting Resonance Liberation - Burial of Thousand Souls or casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander with Wayfarer's Mark restores 200 points of Qi.\n\nFire of Life\nMax 100 points.\n- Casting Resonance Liberation - Burial of Thousand Souls grants 100 points of Fire of Life.\n- All Fire of Life is cleared when Yinghuo ends.\nWhile in Yinghuo, if Fire of Life is not at 0 points, casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander consumes 25 points of Fire of Life, and the DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased based on Jingran's Max HP: The DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased for every 1000 points of Jingran's Max HP over 25000. Up to 25000 points of Jingran's Max HP count towards this effect.\n\nNether to Light\n- Jingran's DEF is fixed at 0.\n- Jingran gains Incoming Healing Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 6.2% Incoming Healing Bonus, up to 310%.\n- Jingran gains Fusion DMG Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 1.5% Fusion DMG Bonus, up to 75%.\n\nYang Changes, Yin Unites\nJingran gains additional ATK based on Max HP: For every 1000 points of Max HP, Jingran gains 36 additional ATK, up to 1800.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "jingran-resource-fire-of-life",
    "characterId": "jingran",
    "name": "Fire of Life",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Fire of Life",
    "maxValue": 100,
    "ruleSummary": "Qi Modulation\nJingran switches between the Yin Vessel and Yang Font states by casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander. Jingran is in the Yang Font state by default.\n\nHeavy Attack - Soul Raid\nWhen Jingran holds 300 points of Qi while in the Yin Vessel state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Soul Raid, dealing Fusion DMG.\nAfter casting Heavy Attack - Soul Raid, Jingran switches to the Yang Font state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nHeavy Attack - Stardome Meander\nWhen Jingran holds 300 points of Qi while in the Yang Font state, hold Normal Attack to consume 300 points of Qi to cast Heavy Attack - Stardome Meander, dealing Fusion DMG.\nAfter casting Heavy Attack - Stardome Meander, Jingran switches to the Yin Vessel state.\nPress or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nHeavy Attack - Stardome Meander can be cast in mid-air.\n\nQi\nMax 300 points.\n- Casting Basic Attack - Drink Soul Stage 3, Basic Attack - Drink Soul Stage 4, Basic Attack - Devil's Bane Stage 3, or Basic Attack - Devil's Bane Stage 4 restores 50 points of Qi.\n- Casting Dodge Counter - Nether Dive, Dodge Counter - Light Watch, Resonance Skill - Netherworld Traverse, Resonance Skill - Afterlife's Guide, or Intro Skill - Question the Tombs restores 100 points of Qi.\n- Casting Resonance Liberation - Burial of Thousand Souls or casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander with Wayfarer's Mark restores 200 points of Qi.\n\nFire of Life\nMax 100 points.\n- Casting Resonance Liberation - Burial of Thousand Souls grants 100 points of Fire of Life.\n- All Fire of Life is cleared when Yinghuo ends.\nWhile in Yinghuo, if Fire of Life is not at 0 points, casting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander consumes 25 points of Fire of Life, and the DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased based on Jingran's Max HP: The DMG Multiplier of this Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander is increased for every 1000 points of Jingran's Max HP over 25000. Up to 25000 points of Jingran's Max HP count towards this effect.\n\nNether to Light\n- Jingran's DEF is fixed at 0.\n- Jingran gains Incoming Healing Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 6.2% Incoming Healing Bonus, up to 310%.\n- Jingran gains Fusion DMG Bonus based on Max HP: For every 1000 points of Max HP, Jingran receives 1.5% Fusion DMG Bonus, up to 75%.\n\nYang Changes, Yin Unites\nJingran gains additional ATK based on Max HP: For every 1000 points of Max HP, Jingran gains 36 additional ATK, up to 1800.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "jingran-resource-wayfarer-s-mark",
    "characterId": "jingran",
    "name": "Wayfarer's Mark",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Wayfarer's Mark",
    "maxValue": 3,
    "ruleSummary": "Resonance Liberation - Burial of Thousand Souls can be cast in mid-air close to the ground.\nAttack the target, dealing Fusion DMG, considered Heavy Attack DMG, and granting 100 points of Fire of Life.\nGain the following effects after casting this skill:\n- If Jingran's current HP is above 50% of the Max HP, reduce his current HP to 50% of the Max HP.\n- Gain 200 points of Qi.\n- Gain 3 stacks of Wayfarer's Mark.\n- Enter the Yinghuo state for 15s.\n\nWayfarer's Mark\nMax 3 stacks.\nCasting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander restores 200 points of Qi and reduces 1 stacks of Wayfarer's Mark. This effect lasts for 15s.\n\nYinghuo\n- Dealing damage with Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander summons Chimei Wangliang to attack the targets, which deals Fusion DMG, considered Heavy Attack DMG. This effect can be triggered once per Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander.\n- All Fire of Life will be removed as Yinghuo ends.\n",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "jingran-resource-ghost-shroud",
    "characterId": "jingran",
    "name": "Ghost Shroud",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Ghost Shroud",
    "maxValue": 50,
    "ruleSummary": "Attack the target, dealing Fusion DMG. Consume and convert all Ghost Shroud to equal stacks of Fortune in Disguise.\nCasting Question the Tombs restores 100 points of Qi.\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nWhile in the Yang Font state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nFortune in Disguise\nMax 50 stacks. Each stack of Fortune in Disguise grants additional Fusion DMG Bonus based on Jingran's Max HP: For every 1000 points of Max HP, Jingran gains 0.05% additional Fusion DMG Bonus for 15s, up to 2.5% for each stack of Fortune in Disguise.\nSwitching to another Resonator ends the effect.\n\nGhost Shroud\n- Max 50 points.\n- When Jingran gains a Shield, he gains 1 points of Ghost Shroud. This effect can be triggered once every 0.5s.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "jingran-resource-fortune-in-disguise",
    "characterId": "jingran",
    "name": "Fortune in Disguise",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Fortune in Disguise",
    "maxValue": 50,
    "ruleSummary": "Attack the target, dealing Fusion DMG. Consume and convert all Ghost Shroud to equal stacks of Fortune in Disguise.\nCasting Question the Tombs restores 100 points of Qi.\nWhile in the Yin Vessel state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Drink Soul Stage 2.\nWhile in the Yang Font state, press or hold Normal Attack shortly after casting this skill to cast Basic Attack - Devil's Bane Stage 2.\n\nFortune in Disguise\nMax 50 stacks. Each stack of Fortune in Disguise grants additional Fusion DMG Bonus based on Jingran's Max HP: For every 1000 points of Max HP, Jingran gains 0.05% additional Fusion DMG Bonus for 15s, up to 2.5% for each stack of Fortune in Disguise.\nSwitching to another Resonator ends the effect.\n\nGhost Shroud\n- Max 50 points.\n- When Jingran gains a Shield, he gains 1 points of Ghost Shroud. This effect can be triggered once every 0.5s.",
    "notes": [
      "Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules."
    ]
  },
  {
    "factId": "jingran-sequence-1",
    "characterId": "jingran",
    "name": "Yin and Yang in Harmony, the Ultimate Law of Being",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 1,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The DMG Multipliers of Resonance Skill - Encroaching Yin, Resonance Skill - Netherworld Traverse, Resonance Skill - Scorching Yang, and Resonance Skill - Afterlife's Guide are increased by 80%.\nResonance Skill - Encroaching Yin, Resonance Skill - Netherworld Traverse, Resonance Skill - Scorching Yang, and Resonance Skill - Afterlife's Guide are now immune to interruption."
  },
  {
    "factId": "jingran-sequence-2",
    "characterId": "jingran",
    "name": "A Solitary Lantern, Across Lands Shade-Trodden",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 2,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The DMG Multipliers of Heavy Attack - Soul Raid and Heavy Attack - Stardome Meander are increased by 46%. While in the Yinghuo state, the DMG Multiplier increase effect via Fire of Life on Heavy Attack - Soul Raid and Heavy Attack - Stardome Meander is increased by 46%.\n\nUpon entering combat, Jingran gains the following effects, triggered once every 4s:\n- Gains 300 points of Qi.\n- Gains Netherworld's Boon.\n\nNetherworld's Boon\nCasting Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander restores 25% of Max Resonance Energy and grants Heavy Attack - Soul Raid and Heavy Attack - Stardome Meander 180% DMG Amplification for 4s."
  },
  {
    "factId": "jingran-sequence-3",
    "characterId": "jingran",
    "name": "World's Course Shifts, Each to Their Rightful Paths",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 3,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When Jingran casts Heavy Attack - Soul Raid or Heavy Attack - Stardome Meander, gain 5 points of Ghost Shroud.\n\nWhen Jingran casts Resonance Liberation - Burial of Thousand Souls, Yang Changes, Yin Unites is replaced by Yin-Yang Everflow for 15s.\n\nYin-Yang Everflow\nJingran gains additional ATK based on Max HP: For every 1000 points of Jingran's Max HP, gain 50 additional ATK, up to 2500."
  },
  {
    "factId": "jingran-sequence-4",
    "characterId": "jingran",
    "name": "Where Reality Meets Illusion, Where Living Meet Dead",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 4,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When a Resonator in the team gains a Shield, all Resonators in the team gain 20% All-Attribute DMG Bonus for 30s."
  },
  {
    "factId": "jingran-sequence-5",
    "characterId": "jingran",
    "name": "Ends Return to Beginnings, Truth of Life Laid Bare",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 5,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When Jingran takes a fatal blow, he will not fall and will instead gain a Shield equal to 50% of Max HP for 15s. This effect can be triggered once every 10 min. This Shield will not be passed on to the incoming Resonator."
  },
  {
    "factId": "jingran-sequence-6",
    "characterId": "jingran",
    "name": "As Favors and Feuds Fade, New Stories Await",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 6,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Targets take 40% more Heavy Attack DMG from Jingran.\n\nThe DMG Multiplier of Chimei Wangliang is increased by 80%.\n\nUpon entering the Yinghuo state, Jingran gains the Parade of Thousand Souls effect for 15s. During this effect, if Jingran is the active Resonator in the team, upon dealing damage, Jingran summons Chimei Wangliang to attack the targets, dealing Fusion DMG, considered Heavy Attack DMG.\n\nChimei Wangliang can be summoned this way at an interval of 1s for up to 8 times. Parade of Thousand Souls ends and the available summon charges of Chimei Wangliang reset when either of the following conditions is met:\n- Cast Resonance Liberation - Burial of Thousand Souls.\n- Yinghuo ends or is removed."
  }
] as const;

export const RELEASE_CHARACTER_KIT_PROFILES: readonly CharacterMechanicsProfile[] = [
  {
    "characterId": "hsin",
    "verificationStatus": "VERIFIED",
    "coverage": [
      {
        "area": "ACTIONS",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "FORTE_RULES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "INHERENT_PASSIVES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "OUTRO_EFFECT",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "RESOURCE_RULES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "SEQUENCES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      }
    ],
    "factIds": [
      "hsin-skill-1006101-rules",
      "hsin-damage-1311101",
      "hsin-damage-1311102",
      "hsin-damage-1311103",
      "hsin-damage-1311104",
      "hsin-damage-1311105",
      "hsin-damage-1311106",
      "hsin-damage-1311107",
      "hsin-damage-1311108",
      "hsin-damage-1311109",
      "hsin-damage-1311110",
      "hsin-damage-1311111",
      "hsin-damage-1311112",
      "hsin-damage-1311113",
      "hsin-damage-1311114",
      "hsin-damage-1311115",
      "hsin-damage-1311116",
      "hsin-damage-1311117",
      "hsin-damage-1311118",
      "hsin-damage-1311119",
      "hsin-damage-1311120",
      "hsin-damage-1311121",
      "hsin-damage-1311122",
      "hsin-skill-1006102-rules",
      "hsin-damage-1311201",
      "hsin-damage-1311202",
      "hsin-skill-1006103-rules",
      "hsin-damage-1311302",
      "hsin-damage-1311303",
      "hsin-skill-1006104-rules",
      "hsin-skill-1006105-rules",
      "hsin-skill-1006106-rules",
      "hsin-damage-1311601",
      "hsin-damage-1311602",
      "hsin-damage-1311603",
      "hsin-damage-1311604",
      "hsin-damage-1311605",
      "hsin-damage-1311606",
      "hsin-skill-1006107-rules",
      "hsin-damage-1311701",
      "hsin-damage-1311702",
      "hsin-damage-1311703",
      "hsin-damage-1311704",
      "hsin-damage-1311203",
      "hsin-skill-1006109-rules",
      "hsin-outro-source-damage",
      "hsin-tune-break-source",
      "hsin-resource-answering-heart",
      "hsin-resource-illumining-heart",
      "hsin-resource-heart-of-thunder",
      "hsin-resource-edict",
      "hsin-resource-unison-boon-base",
      "hsin-resource-thunderglow",
      "hsin-sequence-1",
      "hsin-sequence-2",
      "hsin-sequence-3",
      "hsin-sequence-4",
      "hsin-sequence-5",
      "hsin-sequence-6"
    ],
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/hsin"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    }
  },
  {
    "characterId": "jingran",
    "verificationStatus": "VERIFIED",
    "coverage": [
      {
        "area": "ACTIONS",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "FORTE_RULES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "INHERENT_PASSIVES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "OUTRO_EFFECT",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "RESOURCE_RULES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      },
      {
        "area": "SEQUENCES",
        "status": "VERIFIED",
        "notes": "Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness."
      }
    ],
    "factIds": [
      "jingran-skill-1005901-rules",
      "jingran-damage-1212001",
      "jingran-damage-1212002",
      "jingran-damage-1212003",
      "jingran-damage-1212004",
      "jingran-damage-1212005",
      "jingran-damage-1212006",
      "jingran-damage-1212007",
      "jingran-damage-1212008",
      "jingran-damage-1212009",
      "jingran-damage-1212010",
      "jingran-damage-1212011",
      "jingran-shadow-step-flat-1",
      "jingran-shadow-step-flat-2",
      "jingran-skill-1005902-rules",
      "jingran-damage-1212013",
      "jingran-damage-1212014",
      "jingran-damage-1212015",
      "jingran-damage-1212016",
      "jingran-skill-1005903-rules",
      "jingran-damage-1212019",
      "jingran-damage-1212020",
      "jingran-skill-1005904-rules",
      "jingran-skill-1005905-rules",
      "jingran-skill-1005906-rules",
      "jingran-damage-1212024",
      "jingran-skill-1005907-rules",
      "jingran-damage-1212030",
      "jingran-damage-1212031",
      "jingran-damage-1212026",
      "jingran-damage-1212027",
      "jingran-skill-1005909-rules",
      "jingran-outro-source-damage",
      "jingran-tune-break-source",
      "jingran-resource-qi",
      "jingran-resource-fire-of-life",
      "jingran-resource-wayfarer-s-mark",
      "jingran-resource-ghost-shroud",
      "jingran-resource-fortune-in-disguise",
      "jingran-sequence-1",
      "jingran-sequence-2",
      "jingran-sequence-3",
      "jingran-sequence-4",
      "jingran-sequence-5",
      "jingran-sequence-6"
    ],
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skilldescription.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skillTree/skilltree.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json",
        "https://www.prydwen.gg/wuthering-waves/characters/jingran"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    }
  }
] as const;

export const RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS: readonly CharacterMechanicFact[] = [
  {
    "factId": "buling-sequence-1-release",
    "characterId": "buling",
    "name": "Exorcist Gadgets, Lend Me Your Power",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 1,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The Crit. Rate of Resonance Liberation - Flashing Thunder Spell: Harmony is increased by 20% upon dealing damage."
  },
  {
    "factId": "buling-sequence-2-release",
    "characterId": "buling",
    "name": "Talisman Burns, Spirits Turn",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 2,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Buling restores 25 points of Resonance Energy when she enters the Yin-Yang Balance state. This effect is triggered once every 24s."
  },
  {
    "factId": "buling-sequence-3-release",
    "characterId": "buling",
    "name": "Summoner of Spirits, Seeker of Fate",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 3,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "While Five Thunders Spell Array lasts, whenever the HP of Resonators in the team drops below 50%, immediately restore their HP by 350+150% of Buling's ATK. This effect can be triggered once every 24s."
  },
  {
    "factId": "buling-sequence-4-release",
    "characterId": "buling",
    "name": "Wanderer of Solaris, Blessed by Fortune",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 4,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Buling gains 20% Healing Bonus."
  },
  {
    "factId": "buling-sequence-5-release",
    "characterId": "buling",
    "name": "Forum Ban? New Account!",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 5,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Five Thunders Spell Array instantly inflicts another 6 stacks of Electro Flare on all targets within its range upon generation."
  },
  {
    "factId": "buling-sequence-6-release",
    "characterId": "buling",
    "name": "\"Almighty Forum Lord of Thunder Spell\"",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 6,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The Thunder Spell - Heaven, Earth, Mind state now grants 50% Resonance Skill DMG Bonus to the active Resonator in the team."
  },
  {
    "factId": "buling-resource-trigrams-release",
    "characterId": "buling",
    "name": "Trigrams",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Trigrams",
    "maxValue": 4,
    "ruleSummary": "Basic Attack\nPerform up to 4 consecutive attacks, dealing Electro DMG.\n\nHeavy Attack - Mountain Over Thunder\nHold Normal Attack to consume the highlighted Trigram - Mountain and Trigram - Thunder from left to right and cast Heavy Attack - Mountain Over Thunder, dealing Electro DMG.\n\nHeavy Attack - Thunder Over Mountain\nHold Normal Attack to consume the highlighted Trigram - Thunder and Trigram - Mountain from left to right and cast Heavy Attack - Thunder Over Mountain, dealing a small amount of Electro DMG and additionally reducing the target's Vibration Strength.\n\nHeavy Attack - Twin Mountains\nHold Normal Attack to consume the highlighted 2 Trigrams - Mountain from left to right and cast Heavy Attack - Twin Mountains, healing all nearby Resonators in the team.\n\nHeavy Attack - Twin Thunders\nHold Normal Attack to consume the highlighted 2 Trigrams - Thunder from left to right and cast Heavy Attack - Twin Thunders, healing all nearby Resonators in the team once per second for 8s.\n\nHeavy Attack - Ghost Gate Omen\nWhen holding Normal Attack with fewer than 2 Trigrams, Buling fails the divination, becoming temporarily immobilized and losing all Trigrams and 20% of her current HP. This effect will not consume HP if Buling's current HP is below 1%.\n\nMid-air Attack\nConsume STA to perform Mid-air Attack, dealing Electro DMG.\n\nDodge Counter\nPress Normal Attack right after a successful Dodge to perform Basic Attack Stage 3, dealing Electro DMG.\n- After performing Dodge Counter, press Normal Attack to perform Basic Attack Stage 4.\n\nTrigram\nBuling can hold up to 4 Trigrams. When Trigrams reach the max number, gaining new Trigrams moves all Trigrams 1 slot to the left, and the original leftmost Trigram will be removed.\n- Trigram - Mountain is obtained when Basic Attack Stage 2 deals damage.\n- Trigram - Thunder is obtained when Basic Attack Stage 4 or Mid-air Attack deals damage.\n- Trigram - Thunder is obtained when casting Resonance Skill - In Shadow Thunder Stirs.",
    "notes": []
  },
  {
    "factId": "danjin-sequence-1-release",
    "characterId": "danjin",
    "name": "Crimson Heart of Justice",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 1,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When Danjin attacks a target with Resonance Skill's Incinerating Will, her ATK is increased by 5% for 6s, stacking up to 6 times. Danjin loses 1 stacks of this effect each time she takes damage."
  },
  {
    "factId": "danjin-sequence-2-release",
    "characterId": "danjin",
    "name": "Dusted Mirror",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 2,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When Danjin attacks a target with Resonance Skill's Incinerating Will, her damage dealt is increased by 20%."
  },
  {
    "factId": "danjin-sequence-3-release",
    "characterId": "danjin",
    "name": "Fleeting Blossom",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 3,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Resonance Liberation DMG Bonus is increased by 30%."
  },
  {
    "factId": "danjin-sequence-4-release",
    "characterId": "danjin",
    "name": "Solitary Carnation",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 4,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "When Danjin has more than 60 \"Ruby Blossom\", her Crit. Rate is increased by 15%.\nThis effect lasts until the end of Heavy Attack: Scatterbloom even after all \"Ruby Blossom\" is consumed when casting Heavy Attack: Chaoscleave."
  },
  {
    "factId": "danjin-sequence-5-release",
    "characterId": "danjin",
    "name": "Reigning Blade",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 5,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Danjin's Havoc DMG Bonus is increased by 15%, and further increased by another 15% when her HP is lower than 60%."
  },
  {
    "factId": "danjin-sequence-6-release",
    "characterId": "danjin",
    "name": "Bloodied Jade",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 6,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Heavy Attack Chaoscleave increases the ATK of all team members by 20% for 20s."
  },
  {
    "factId": "danjin-resource-ruby-blossom-release",
    "characterId": "danjin",
    "name": "Ruby Blossom",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Ruby Blossom",
    "maxValue": 120,
    "ruleSummary": "Heavy Attack: Chaoscleave\nAfter accumulating 60 \"Ruby Blossom\", long press Basic Attack to consume all \"Ruby Blossom\" to cast Chaoscleave, dealing Havoc DMG, considered as Heavy Attack DMG, and healing Danjin.\nIf current \"Ruby Blossom\" reaches over 120, 120 \"Ruby Blossom\" is consumed instead to increase the DMG multiplier of Chaoscleave and Scatterbloom performed this time.\n \nHeavy Attack: Scatterbloom\nUse Basic Attack after Heavy Attack Chaoscleave to cast Scatterbloom to attack the target, dealing Havoc DMG, considered as Heavy Attack DMG.\n \nRuby Blossom\nDanjin can hold up to 120 Ruby Blossom.\nDanjin obtains \"Ruby Blossom\" when using Resonance Skill Crimson Fragment.",
    "notes": [
      "Cap 120 is source-explicit. The English over-120 clause is preserved as translation evidence; the owner resolves full-power activation as full meter, exactly 120, consuming 120 (Issue #348, reaffirmed 2026-10-22)."
    ]
  },
  {
    "factId": "xiangli-yao-sequence-1-release",
    "characterId": "xiangli-yao",
    "name": "Prodigy of Protégés",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 1,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Resonance Skill Law of Reigns additionally launches 6 Convolution Matrices at enemies, each dealing Resonance Liberation DMG equal to 8% of the skill's DMG Multiplier."
  },
  {
    "factId": "xiangli-yao-sequence-2-release",
    "characterId": "xiangli-yao",
    "name": "Traces of Predecessors",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 2,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Casting Resonance Skill or Resonance Liberation Cogitation Model increases Crit. DMG by 30% for 8s."
  },
  {
    "factId": "xiangli-yao-sequence-3-release",
    "characterId": "xiangli-yao",
    "name": "Ruins of Ancient",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 3,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Casting Resonance Liberation Cogitation Model increases the DMG of the following Resonance Skill moves by 63% for 24s:\nDecipher, Deduction, Divergence, and Law of Reigns.\nThis effect can be triggered up to 5 times."
  },
  {
    "factId": "xiangli-yao-sequence-4-release",
    "characterId": "xiangli-yao",
    "name": "Vessel of Rebirth",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 4,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "Casting Resonance Liberation Cogitation Model grants a 25% DMG Bonus to all team members' Resonance Liberation for 30s."
  },
  {
    "factId": "xiangli-yao-sequence-5-release",
    "characterId": "xiangli-yao",
    "name": "End of Stars",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 5,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The DMG Multiplier of Outro Skill Chain Rule is increased by 222%. The DMG Multiplier of Resonance Liberation Cogitation Model is increased by 100%."
  },
  {
    "factId": "xiangli-yao-sequence-6-release",
    "characterId": "xiangli-yao",
    "name": "Solace of the Ordinary",
    "section": "RESONANCE_CHAIN",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "SEQUENCE",
    "sequence": 6,
    "triggerSummary": "Exact source conditions retained in effectSummary.",
    "effectSummary": "The Hypercubes obtained from Resonance Liberation Cogitation Model are enhanced, increasing the DMG Multiplier of Resonance Skill Law of Reigns by 76%."
  },
  {
    "factId": "xiangli-yao-resource-capacity-release",
    "characterId": "xiangli-yao",
    "name": "Capacity",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Capacity",
    "maxValue": 100,
    "ruleSummary": "Resonance Skill - Decipher\nWhen Capacity reaches 100, Resonance Skill Deduction is replaced by Resonance Skill Decipher.\nConsume 100 Capacity to cast Resonance Skill Decipher, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nResonance Skill - Law of Reigns\nWhen Performance Capacity reaches 5 in Intuition state, Resonance Skill Divergence is replaced by Resonance Skill Law of Reigns.\nConsume 5 Performance Capacity to cast Resonance Skill Law of Reigns, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nMid-air Attack - Revamp\nShortly after casting Resonance Skill Decipher or Resonance Skill Divergence, use Basic Attack to perform Mid-air Attack Revamp at the cost of STA, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nCapacity\nXiangli Yao can hold up to 100 Capacity.\nEvery Normal Attack Probe on hit grants Capacity.\nEvery Resonance Skill Deduction on hit grants Capacity.\n\nPerformance Capacity\nXiangli Yao can hold up to 5 Performance Capacity.\nWhen in Intuition triggered by Resonance Liberation:\nObtain 1 Performance Capacity when Stage 1 of Basic Attack Pivot - Impale hits a target.\nObtain 2 Performance Capacity when Stage 2 or 3 of Basic Attack Pivot - Impale hits a target.\nObtain 2 Performance Capacity for every Resonance Skill Divergence on hit.\nObtain 3 Performance Capacity for every Mid-air Attack Revamp on hit.\nObtain 2 Performance Capacity for every Dodge Counter Unfathomed on hit.",
    "notes": []
  },
  {
    "factId": "xiangli-yao-resource-performance-capacity-release",
    "characterId": "xiangli-yao",
    "name": "Performance Capacity",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Performance Capacity",
    "maxValue": 5,
    "ruleSummary": "Resonance Skill - Decipher\nWhen Capacity reaches 100, Resonance Skill Deduction is replaced by Resonance Skill Decipher.\nConsume 100 Capacity to cast Resonance Skill Decipher, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nResonance Skill - Law of Reigns\nWhen Performance Capacity reaches 5 in Intuition state, Resonance Skill Divergence is replaced by Resonance Skill Law of Reigns.\nConsume 5 Performance Capacity to cast Resonance Skill Law of Reigns, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nMid-air Attack - Revamp\nShortly after casting Resonance Skill Decipher or Resonance Skill Divergence, use Basic Attack to perform Mid-air Attack Revamp at the cost of STA, dealing Electro DMG, considered as Resonance Liberation DMG.\n\nCapacity\nXiangli Yao can hold up to 100 Capacity.\nEvery Normal Attack Probe on hit grants Capacity.\nEvery Resonance Skill Deduction on hit grants Capacity.\n\nPerformance Capacity\nXiangli Yao can hold up to 5 Performance Capacity.\nWhen in Intuition triggered by Resonance Liberation:\nObtain 1 Performance Capacity when Stage 1 of Basic Attack Pivot - Impale hits a target.\nObtain 2 Performance Capacity when Stage 2 or 3 of Basic Attack Pivot - Impale hits a target.\nObtain 2 Performance Capacity for every Resonance Skill Divergence on hit.\nObtain 3 Performance Capacity for every Mid-air Attack Revamp on hit.\nObtain 2 Performance Capacity for every Dodge Counter Unfathomed on hit.",
    "notes": []
  },
  {
    "factId": "xiangli-yao-resource-hypercubes-release",
    "characterId": "xiangli-yao",
    "name": "Hypercubes",
    "section": "FORTE_CIRCUIT",
    "verificationStatus": "VERIFIED",
    "modelingStatus": "RAW_ONLY",
    "conditional": true,
    "provenance": {
      "sourceLabels": [
        "Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968",
        "Prydwen / wuther.in post-release kit cross-check"
      ],
      "sourceUrls": [
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/skill/skill.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/resonate_chain/resonantchain.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/Textmaps/en/multi_text/MultiText.json",
        "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/9218d612ad815e398e064e577e42aaf878899968/BinData/damage/damage.json"
      ],
      "checkedAt": "2026-10-11",
      "notes": [
        "Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.",
        "Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics."
      ]
    },
    "kind": "RESOURCE",
    "resourceName": "Hypercubes",
    "maxValue": 3,
    "ruleSummary": "Attack the target, dealing Electro DMG. Enter Intuition.\nWhen in Intuition:\n-Obtain 3 Hypercube(s). Each time Resonance Skill Law of Reigns is cast, consume 1 Hypercube(s). Intuition ends once all Hypercubes are consumed.\n-Basic Attack and Heavy Attack are replaced with Basic Attack Pivot - Impale, which performs up to 3 consecutive attacks, dealing Electro DMG.\n-Resonance Skill Deduction is replaced with Resonance Skill Divergence, which deals Electro DMG.\n-Dodge Counter is replaced with Dodge Counter Unfathomed, considered as Resonance Liberation DMG.",
    "notes": []
  }
] as const;
