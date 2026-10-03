import type { CharacterRecommendationSource, CharacterRecommendationReview } from '../characterRecommendationDomain.ts';

// Explicit review, never generated from candidate field presence.
export const CHARACTER_RECOMMENDATION_SOURCES: readonly CharacterRecommendationSource[] = [
  {
    "id": "augusta-character-recommendation-sources-2026-10-03",
    "characterId": "augusta",
    "researchArtifact": "data/research/augusta-character-recommendations-2026-10-03.json",
    "researchBinding": "051671a89b3dcc6fff287c4865e7c77a8e79692cd28ee30323587ad788f673e8",
    "evidence": [
      {
        "id": "augusta-legacy-er-reference",
        "characterId": "augusta",
        "metric": "TOTAL_ENERGY_REGEN",
        "sourceIdentity": "Prydwen Augusta build (legacy repository paraphrase)",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-08-29",
        "evidenceClass": "LEGACY_PROFILE_REFERENCE",
        "artifact": "src/data/statTargetProfiles.ts",
        "locator": "augusta-recommended-targets-v915-current / gates[0].notes",
        "originalText": null,
        "excerpt": "Current Prydwen endgame band is 116%-125%; higher end is estimated for Iuno + Shorekeeper, matching the existing standard context.",
        "context": {
          "description": "Legacy standard Augusta context; primary-source basis not recaptured.",
          "conditions": [
            "Higher end is estimated for Iuno + Shorekeeper."
          ],
          "team": "Iuno + Shorekeeper",
          "weapon": null,
          "sequence": null,
          "rotation": null,
          "measurementBasis": null
        }
      },
      {
        "id": "augusta-prydwen-total_hp-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_HP",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_HP",
        "originalText": "14500+",
        "excerpt": "HP: 14500+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-total_def-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_DEF",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_DEF",
        "originalText": "1100+",
        "excerpt": "DEF: 1100+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-total_atk-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_ATK",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_ATK",
        "originalText": "2000-2800+",
        "excerpt": "ATK: 2000-2800+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-total_crit_rate-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_CRIT_RATE",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_CRIT_RATE",
        "originalText": "65-80%+",
        "excerpt": "CRIT Rate: 65-80%+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-total_crit_damage-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_CRIT_DAMAGE",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_CRIT_DAMAGE",
        "originalText": "210-260%+",
        "excerpt": "CRIT DMG: 210-260%+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-total_energy_regen-2026-10-03",
        "characterId": "augusta",
        "metric": "TOTAL_ENERGY_REGEN",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.TOTAL_ENERGY_REGEN",
        "originalText": "116%-125%",
        "excerpt": "Energy Regen: 116%-125%",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [
            "Lower endpoint 116% corresponds to Mortefi + Shorekeeper.",
            "Higher endpoint 125% corresponds to Iuno + Shorekeeper."
          ],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      },
      {
        "id": "augusta-prydwen-electro_dmg_bonus-2026-10-03",
        "characterId": "augusta",
        "metric": "ELECTRO_DMG_BONUS",
        "sourceIdentity": "Prydwen Augusta build",
        "sourceUrl": "https://www.prydwen.gg/wuthering-waves/characters/augusta",
        "checkedAt": "2026-10-03",
        "evidenceClass": "PRIMARY_SOURCE_CAPTURE",
        "artifact": "data/research/augusta-character-recommendations-2026-10-03.json",
        "locator": "sourceAccess[2].statLines.ELECTRO_DMG_BONUS",
        "originalText": "40-70%+",
        "excerpt": "Electro DMG Bonus: 40-70%+",
        "context": {
          "description": "Externally supplied current Prydwen capture, reviewed 2026-10-03; page updated 2026-09-10; Patch 3.6 Level 90 endgame recommendations for a 5-star at S0. Codex direct fetch was blocked.",
          "conditions": [],
          "team": null,
          "weapon": null,
          "sequence": "S0",
          "rotation": null,
          "measurementBasis": "Total stats shown in the in-game stat screen while the Character is out of combat but active in the party."
        }
      }
    ]
  }
];

export const CHARACTER_RECOMMENDATION_REVIEWS: readonly CharacterRecommendationReview[] = [
  {
    "id": "AUGUSTA-CHARACTER-RECOMMENDATION-REVIEW-2026-10-03",
    "characterId": "augusta",
    "sourceId": "augusta-character-recommendation-sources-2026-10-03",
    "checkedAt": "2026-10-03",
    "sourceBinding": "d0fbfd02fa424cfe553c44e61655a34dc17433e88a8eada428bbda8eea135ea4",
    "rows": [
      {
        "metric": "TOTAL_HP",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_hp-2026-10-03"
        ],
        "reason": "Exact current externally supplied Prydwen wording supports this explicit Bellibing interpretation; ER endpoints retain team conditions as prose.",
        "interpretation": {
          "kind": "MINIMUM",
          "minimum": 14500
        }
      },
      {
        "metric": "TOTAL_DEF",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_def-2026-10-03"
        ],
        "reason": "Exact current externally supplied Prydwen wording supports this explicit Bellibing interpretation; ER endpoints retain team conditions as prose.",
        "interpretation": {
          "kind": "MINIMUM",
          "minimum": 1100
        }
      },
      {
        "metric": "TOTAL_ATK",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_atk-2026-10-03"
        ],
        "reason": "Exact captured primary wording is explicitly reviewed as an open-ended band: minimum recommendation endpoint and upper reference with trailing + preserved; no maximum, preferred target or evaluator behavior inferred.",
        "interpretation": {
          "kind": "OPEN_ENDED_BAND",
          "minimum": 2000,
          "upperReference": 2800
        }
      },
      {
        "metric": "TOTAL_CRIT_RATE",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_crit_rate-2026-10-03"
        ],
        "reason": "Exact captured primary wording is explicitly reviewed as an open-ended band: minimum recommendation endpoint and upper reference with trailing + preserved; no maximum, preferred target or evaluator behavior inferred.",
        "interpretation": {
          "kind": "OPEN_ENDED_BAND",
          "minimum": 0.65,
          "upperReference": 0.8
        }
      },
      {
        "metric": "TOTAL_CRIT_DAMAGE",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_crit_damage-2026-10-03"
        ],
        "reason": "Exact captured primary wording is explicitly reviewed as an open-ended band: minimum recommendation endpoint and upper reference with trailing + preserved; no maximum, preferred target or evaluator behavior inferred.",
        "interpretation": {
          "kind": "OPEN_ENDED_BAND",
          "minimum": 2.1,
          "upperReference": 2.6
        }
      },
      {
        "metric": "TOTAL_ENERGY_REGEN",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-total_energy_regen-2026-10-03"
        ],
        "reason": "Exact current externally supplied Prydwen wording supports this explicit Bellibing interpretation; ER endpoints retain team conditions as prose.",
        "interpretation": {
          "kind": "BOUNDED_RANGE",
          "minimum": 1.16,
          "upper": 1.25
        }
      },
      {
        "metric": "ELECTRO_DMG_BONUS",
        "decision": "APPROVED_FOR_CANONICAL_VERIFIED",
        "evidenceIds": [
          "augusta-prydwen-electro_dmg_bonus-2026-10-03"
        ],
        "reason": "Exact captured primary wording is explicitly reviewed as an open-ended band: minimum recommendation endpoint and upper reference with trailing + preserved; no maximum, preferred target or evaluator behavior inferred.",
        "interpretation": {
          "kind": "OPEN_ENDED_BAND",
          "minimum": 0.4,
          "upperReference": 0.7
        }
      }
    ]
  }
];
