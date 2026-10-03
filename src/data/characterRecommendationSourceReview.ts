import type { CharacterRecommendationSource, CharacterRecommendationReview } from '../characterRecommendationDomain.ts';

// Explicit review, never generated from candidate field presence.
export const CHARACTER_RECOMMENDATION_SOURCES: readonly CharacterRecommendationSource[] = [
  {
    "id": "augusta-character-recommendation-sources-2026-10-03",
    "characterId": "augusta",
    "researchArtifact": "data/research/augusta-character-recommendations-2026-10-03.json",
    "researchBinding": "498032147dda7afe895f74f371d53c42065b910f0d7581669a1464146b1989d2",
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
    "sourceBinding": "dfd4512a5715d4f27c29babb339fffa1de92acc3ba5982fd051d6851991246de",
    "rows": [
      {
        "metric": "TOTAL_HP",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      },
      {
        "metric": "TOTAL_DEF",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      },
      {
        "metric": "TOTAL_ATK",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      },
      {
        "metric": "TOTAL_CRIT_RATE",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      },
      {
        "metric": "TOTAL_CRIT_DAMAGE",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      },
      {
        "metric": "TOTAL_ENERGY_REGEN",
        "decision": "PENDING",
        "evidenceIds": [
          "augusta-legacy-er-reference"
        ],
        "reason": "Primary-source access blocked; legacy ER paraphrase lacks exact wording and measurement basis for this dedicated review.",
        "interpretation": null
      },
      {
        "metric": "ELECTRO_DMG_BONUS",
        "decision": "PENDING",
        "evidenceIds": [],
        "reason": "No Augusta primary-source total-stat statement captured; presentation scaffolding is not evidence.",
        "interpretation": null
      }
    ]
  }
];
