// Generated from separately reviewed published timing evidence. No engine registration.
import type { StandardTeamRotationTimingReference, TeamTimingCaseCoverage } from '../standardTeamRotationTimingDomain.ts';
export const STANDARD_TEAM_ROTATION_TIMING_REVIEW = {
  "reviewedAt": "2026-10-12",
  "reviewArtifact": "data/source/standard-team-rotation-timing-review-2026-10-12.json",
  "reviewSha256": "6e807150167ca893b6b65520c2ad4dadcff8f3c91ec85dfb4567528a1d88a2b3",
  "evidenceArtifact": "data/source/standard-team-rotation-timing-evidence-2026-10-12.json",
  "evidenceSha256": "9ee5fca856eec0bc9304cb90371ee5623a889c5b1c4c73798416a8bf68860aca",
  "methodology": {
    "url": "https://arabwuwa.com/methodology/",
    "reviewedLines": [
      37,
      40,
      41,
      42,
      47,
      54
    ],
    "basis": "PROVIDER_REPORTED_GAMEPLAY_TIMING",
    "clock": "SOURCE_CLOCK_UNSPECIFIED",
    "summary": "Provider describes three gameplay-tested rotations with standardized builds, adequate Energy and clean execution; cancels can be used. Damage is spreadsheet-calculated. It does not define whether cinematic/time-stop seconds are included in the timing clock."
  },
  "scope": "PUBLISHED_FIELD_BUDGETS_AND_DERIVED_BOUNDARIES_NOT_ACTION_TIMING_OR_DPS"
} as const;
export const STANDARD_TEAM_ROTATION_TIMING_REFERENCES: readonly StandardTeamRotationTimingReference[] = [
  {
    "id": "arabwuwa-augusta-iuno-shorekeeper-35",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/augusta-iuno-shorekeeper-35/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 25.99,
    "builds": [
      {
        "characterId": "augusta",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Thunderflare Dominion",
        "refinement": 1,
        "sonataLabel": "Crown of Valor"
      },
      {
        "characterId": "iuno",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Moongazer’s Sigil",
        "refinement": 1,
        "sonataLabel": "Crown of Valor"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 67,
        "reportedCycleSeconds": 25.85,
        "summaryLine": 69,
        "members": [
          {
            "characterId": "augusta",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.58,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 90
          },
          {
            "characterId": "iuno",
            "sourceActionLabel": "Basic (Sub-DPS)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.21,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 91
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 92
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 93,
        "reportedCycleSeconds": 26.06,
        "summaryLine": 95,
        "members": [
          {
            "characterId": "augusta",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.58,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 110
          },
          {
            "characterId": "iuno",
            "sourceActionLabel": "Basic (Sub-DPS)",
            "sourceIntroLabel": "Intro With Skill for Energy",
            "fieldSeconds": 9.73,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 111
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 112
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 113,
        "reportedCycleSeconds": 26.06,
        "summaryLine": 115,
        "members": [
          {
            "characterId": "augusta",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.58,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 119
          },
          {
            "characterId": "iuno",
            "sourceActionLabel": "Basic (Sub-DPS)",
            "sourceIntroLabel": "Intro With Skill for Energy",
            "fieldSeconds": 9.73,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 120
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 121
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-augusta-iuno-shorekeeper-35",
      "coordinationCaseId": "augusta-iuno-shorekeeper",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-augusta-standard",
        "prydwen-iuno-augusta-semi-dps",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "the-shorekeeper",
        "iuno",
        "augusta"
      ],
      "orderEvidenceLines": [
        73,
        79,
        85
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Iuno använder sin Skill för energi i loopen: 9,73 s mot 8,21 s i öppningen. Augusta använder ett Echo; guiden och den tidssatta källan har olika detaljer."
      ]
    }
  },
  {
    "id": "arabwuwa-cartethyia-ciaccona-rover-aero-40",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/cartethyia-ciaccona-rover-aero-40/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.86,
    "builds": [
      {
        "characterId": "cartethyia",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Defier's Thorn",
        "refinement": 1,
        "sonataLabel": "Windward Pilgrimage"
      },
      {
        "characterId": "ciaccona",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Woodland Aria",
        "refinement": 1,
        "sonataLabel": "Gusts of Welkin"
      },
      {
        "characterId": "rover-aero",
        "sequence": 6,
        "sourceLine": 57,
        "weaponName": "Bloodpact's Pledge",
        "refinement": 5,
        "sonataLabel": "Windward Pilgrimage"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 64,
        "reportedCycleSeconds": 27.25,
        "summaryLine": 66,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 86
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 87
          },
          {
            "characterId": "rover-aero",
            "sourceActionLabel": "With Cartethyia - 2nd Unbound (Cancel)",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.4,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 88
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 89,
        "reportedCycleSeconds": 26.66,
        "summaryLine": 91,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 106
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 107
          },
          {
            "characterId": "rover-aero",
            "sourceActionLabel": "With Cartethyia - 2nd Unbound (Cancel)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.81,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 108
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 109,
        "reportedCycleSeconds": 26.66,
        "summaryLine": 111,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 115
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 116
          },
          {
            "characterId": "rover-aero",
            "sourceActionLabel": "With Cartethyia - 2nd Unbound (Cancel)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.81,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 117
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-cartethyia-ciaccona-rover-aero-40",
      "coordinationCaseId": "cartethyia-ciaccona-rover-aero",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-cartethyia-standard",
        "prydwen-ciaccona-standard",
        "prydwen-rover-aero-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "rover-aero",
        "ciaccona",
        "cartethyia"
      ],
      "orderEvidenceLines": [
        70,
        76,
        82
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Loopen använder Ciacconas vanliga Basic-kedjor. Öppningens instruktion visar jump cancels medan tabellen anger Basic och 6,86 s; den öppningen väljs inte som standard. Rover är S6 med R5 Bloodpact i källan. Unbound Flow fortsätter off-field och räknas inte som extra aktiv fälttid."
      ]
    }
  },
  {
    "id": "arabwuwa-aemeath-lynae-mornye-86",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/aemeath-lynae-mornye-86/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.18,
    "builds": [
      {
        "characterId": "aemeath",
        "sequence": 0,
        "sourceLine": 44,
        "weaponName": "Everbright Polestar",
        "refinement": 1,
        "sonataLabel": "Trailblazing Star"
      },
      {
        "characterId": "lynae",
        "sequence": 0,
        "sourceLine": 50,
        "weaponName": "Spectrum Blaster",
        "refinement": 1,
        "sonataLabel": "Pact of Neonlight Leap"
      },
      {
        "characterId": "mornye",
        "sequence": 0,
        "sourceLine": 56,
        "weaponName": "Starfield Calibrator",
        "refinement": 1,
        "sonataLabel": "Halo of Starry Radiance"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 65,
        "reportedCycleSeconds": 27.55,
        "summaryLine": 67,
        "members": [
          {
            "characterId": "aemeath",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.33,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 88
          },
          {
            "characterId": "lynae",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.3,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 89
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 7.92,
            "waitSeconds": 0,
            "difficulty": 0.5,
            "sourceLine": 90
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 91,
        "reportedCycleSeconds": 25.49,
        "summaryLine": 93,
        "members": [
          {
            "characterId": "aemeath",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.33,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 114
          },
          {
            "characterId": "lynae",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.3,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 115
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.86,
            "waitSeconds": 0,
            "difficulty": 0.5,
            "sourceLine": 116
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 117,
        "reportedCycleSeconds": 25.49,
        "summaryLine": 119,
        "members": [
          {
            "characterId": "aemeath",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.33,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 123
          },
          {
            "characterId": "lynae",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.3,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 124
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.86,
            "waitSeconds": 0,
            "difficulty": 0.5,
            "sourceLine": 125
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-aemeath-lynae-mornye-86",
      "coordinationCaseId": "aemeath-lynae-mornye",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-aemeath-standard",
        "prydwen-mornye-standard",
        "prydwen-lynae-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {
        "aemeath": "tune-rupture"
      },
      "actorOrder": [
        "mornye",
        "lynae",
        "aemeath"
      ],
      "orderEvidenceLines": [
        71,
        77,
        83
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Tune Rupture-varianten inkluderar Tune Break. Källans Mornye-ordning och Aemeaths förberedelse skiljer sig från Prydwen; tiderna hör till denna teamvariant."
      ]
    }
  },
  {
    "id": "arabwuwa-galbrena-lucilla-shorekeeper-140",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/galbrena-lucilla-shorekeeper-140/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.77,
    "builds": [
      {
        "characterId": "galbrena",
        "sequence": 0,
        "sourceLine": 44,
        "weaponName": "Lux & Umber",
        "refinement": 1,
        "sonataLabel": "Flamewing's Shadow"
      },
      {
        "characterId": "lucilla",
        "sequence": 0,
        "sourceLine": 50,
        "weaponName": "Freeze Frame",
        "refinement": 1,
        "sonataLabel": "Moonlit Clouds"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 56,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 66,
        "reportedCycleSeconds": 27.64,
        "summaryLine": 68,
        "members": [
          {
            "characterId": "galbrena",
            "sourceActionLabel": "3 Wings",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.04,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 88
          },
          {
            "characterId": "lucilla",
            "sourceActionLabel": "Basic with Heron",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.54,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 89
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 90
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 91,
        "reportedCycleSeconds": 26.33,
        "summaryLine": 93,
        "members": [
          {
            "characterId": "galbrena",
            "sourceActionLabel": "3 Wings",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.04,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 113
          },
          {
            "characterId": "lucilla",
            "sourceActionLabel": "Basic with Heron",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.54,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 114
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 115
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 116,
        "reportedCycleSeconds": 26.33,
        "summaryLine": 118,
        "members": [
          {
            "characterId": "galbrena",
            "sourceActionLabel": "3 Wings",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.04,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 122
          },
          {
            "characterId": "lucilla",
            "sourceActionLabel": "Basic with Heron",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.54,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 123
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 124
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-galbrena-lucilla-shorekeeper-140",
      "coordinationCaseId": null,
      "caseRelationship": "ADDITIONAL_RESEARCH_TRIO",
      "relatedReferenceIds": [
        "prydwen-lucilla-standard",
        "prydwen-galbrena-standard",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {
        "lucilla": "echo-skill"
      },
      "actorOrder": [
        "the-shorekeeper",
        "lucilla",
        "galbrena"
      ],
      "orderEvidenceLines": [
        72,
        78,
        84
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Lucilla använder normal hastighet och Heron med Moonlit Clouds. Galbrena har tre Wings och uttryckliga Hellstride/dodge-avbrott; ingen avancerad quickswap visas. Prydwen listar andra avbrott och Perfect Release."
      ]
    }
  },
  {
    "id": "arabwuwa-cartethyia-ciaccona-chisa-50",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/cartethyia-ciaccona-chisa-50/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 28.45,
    "builds": [
      {
        "characterId": "cartethyia",
        "sequence": 0,
        "sourceLine": 44,
        "weaponName": "Defier's Thorn",
        "refinement": 1,
        "sonataLabel": "Windward Pilgrimage"
      },
      {
        "characterId": "ciaccona",
        "sequence": 0,
        "sourceLine": 50,
        "weaponName": "Woodland Aria",
        "refinement": 1,
        "sonataLabel": "Gusts of Welkin"
      },
      {
        "characterId": "chisa",
        "sequence": 0,
        "sourceLine": 56,
        "weaponName": "Kumokiri",
        "refinement": 1,
        "sonataLabel": "Thread of Severed Fate & Havoc Eclipse"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 67,
        "reportedCycleSeconds": 29.51,
        "summaryLine": 69,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 90
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 91
          },
          {
            "characterId": "chisa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 8.66,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 92
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 93,
        "reportedCycleSeconds": 27.92,
        "summaryLine": 95,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 104
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 105
          },
          {
            "characterId": "chisa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.07,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 106
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 107,
        "reportedCycleSeconds": 27.92,
        "summaryLine": 109,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 113
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 114
          },
          {
            "characterId": "chisa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.07,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 115
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-cartethyia-ciaccona-chisa-50",
      "coordinationCaseId": "cartethyia-ciaccona-chisa",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-chisa-standard",
        "prydwen-ciaccona-standard",
        "prydwen-cartethyia-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "chisa",
        "ciaccona",
        "cartethyia"
      ],
      "orderEvidenceLines": [
        73,
        79,
        85
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Ciaccona använder normal rotation utan jump cancels. Cartethyia-källan använder dodge-/Liberation-avbrott och en annan Skill-ordning än Prydwen. Chisa använder ett skade-set, inte healer-setup."
      ]
    }
  },
  {
    "id": "arabwuwa-zani-phoebe-shorekeeper-33",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/zani-phoebe-shorekeeper-33/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.13,
    "builds": [
      {
        "characterId": "zani",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Blazing Justice",
        "refinement": 1,
        "sonataLabel": "Eternal Radiance"
      },
      {
        "characterId": "phoebe",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Luminous Hymn",
        "refinement": 1,
        "sonataLabel": "Moonlit Clouds"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 68,
        "reportedCycleSeconds": 27,
        "summaryLine": 70,
        "members": [
          {
            "characterId": "zani",
            "sourceActionLabel": "Basic - Phoebe",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.7,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 97
          },
          {
            "characterId": "phoebe",
            "sourceActionLabel": "Basic - SubDPS - Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.24,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 98
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 99
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 100,
        "reportedCycleSeconds": 25.69,
        "summaryLine": 102,
        "members": [
          {
            "characterId": "zani",
            "sourceActionLabel": "Basic - Phoebe",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.7,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 106
          },
          {
            "characterId": "phoebe",
            "sourceActionLabel": "Basic - SubDPS - Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.24,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 107
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 108
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 109,
        "reportedCycleSeconds": 25.69,
        "summaryLine": 111,
        "members": [
          {
            "characterId": "zani",
            "sourceActionLabel": "Basic - Phoebe",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 12.7,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 115
          },
          {
            "characterId": "phoebe",
            "sourceActionLabel": "Basic - SubDPS - Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 8.24,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 116
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 117
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-zani-phoebe-shorekeeper-33",
      "coordinationCaseId": "zani-phoebe-confession",
      "caseRelationship": "BROAD_PARTNER_MATCH",
      "relatedReferenceIds": [
        "prydwen-zani-standard",
        "prydwen-phoebe-confession",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {
        "phoebe": "confession"
      },
      "actorOrder": null,
      "orderEvidenceLines": [
        74,
        80,
        86,
        92
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "AGGREGATE_ONLY_SPLIT_VISITS",
      "executionStyle": "REENTRY_REQUIRES_VISIT_TIMING",
      "infoSv": [
        "Två Nightfall. Phoebes 8,24 s delas på två besök runt Shorekeeper. Källan ger totaltid per karaktär men inga tider för besöken; dessa får inte ersättas med en enda sammanhängande Phoebe-fas."
      ]
    }
  },
  {
    "id": "arabwuwa-brant-lupa-mornye-84",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/brant-lupa-mornye-84/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 23.5,
    "builds": [
      {
        "characterId": "brant",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Unflickering Valor",
        "refinement": 1,
        "sonataLabel": "Tidebreaking Courage"
      },
      {
        "characterId": "lupa",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Wildfire Mark",
        "refinement": 1,
        "sonataLabel": "Flaming Clawprint"
      },
      {
        "characterId": "mornye",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Starfield Calibrator",
        "refinement": 1,
        "sonataLabel": "Halo of Starry Radiance"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 66,
        "reportedCycleSeconds": 23.74,
        "summaryLine": 68,
        "members": [
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 89
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.95,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 90
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 7.92,
            "waitSeconds": 0,
            "difficulty": 0.5,
            "sourceLine": 91
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 92,
        "reportedCycleSeconds": 23.02,
        "summaryLine": 94,
        "members": [
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 103
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 8.03,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 104
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.86,
            "waitSeconds": 1.26,
            "difficulty": 0.5,
            "sourceLine": 105
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 106,
        "reportedCycleSeconds": 23.74,
        "summaryLine": 108,
        "members": [
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 112
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 8.03,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 113
          },
          {
            "characterId": "mornye",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 5.86,
            "waitSeconds": 1.98,
            "difficulty": 0.5,
            "sourceLine": 114
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-brant-lupa-mornye-84",
      "coordinationCaseId": "brant-lupa-mornye-dps",
      "caseRelationship": "ALTERNATIVE_ONE_ANCHOR_NOT_DOUBLE_FORTE",
      "relatedReferenceIds": [
        "prydwen-brant-standard",
        "prydwen-lupa-standard",
        "prydwen-mornye-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "mornye",
        "lupa",
        "brant"
      ],
      "orderEvidenceLines": [
        72,
        78,
        84
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Detta är en enkel en-Anchor-alternativrotation. Befintligt Prydwen-teamfall är dubbel Forte med återinträde; 7,87 s får inte kopieras dit. Loopen har 1,26 respektive 1,98 s väntan på Mornye; exakt placering av väntan publiceras inte."
      ]
    }
  },
  {
    "id": "arabwuwa-cantarella-qiuyuan-phrolova-43",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/cantarella-qiuyuan-phrolova-43/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.06,
    "builds": [
      {
        "characterId": "cantarella",
        "sequence": 0,
        "sourceLine": 44,
        "weaponName": "Whispers of Sirens",
        "refinement": 1,
        "sonataLabel": "Midnight Veil"
      },
      {
        "characterId": "qiuyuan",
        "sequence": 0,
        "sourceLine": 50,
        "weaponName": "Emerald Sentence",
        "refinement": 1,
        "sonataLabel": "Law of Harmony & Sierra Gale"
      },
      {
        "characterId": "phrolova",
        "sequence": 0,
        "sourceLine": 56,
        "weaponName": "Lethean Elegy",
        "refinement": 1,
        "sonataLabel": "Dream of the Lost"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 66,
        "reportedCycleSeconds": 25.81,
        "summaryLine": 68,
        "members": [
          {
            "characterId": "cantarella",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.98,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 89
          },
          {
            "characterId": "qiuyuan",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.96,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 90
          },
          {
            "characterId": "phrolova",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 10.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 91
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 92,
        "reportedCycleSeconds": 26.18,
        "summaryLine": 94,
        "members": [
          {
            "characterId": "cantarella",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.98,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 103
          },
          {
            "characterId": "qiuyuan",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.96,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 104
          },
          {
            "characterId": "phrolova",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 11.24,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 105
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 106,
        "reportedCycleSeconds": 26.18,
        "summaryLine": 108,
        "members": [
          {
            "characterId": "cantarella",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.98,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 112
          },
          {
            "characterId": "qiuyuan",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.96,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 113
          },
          {
            "characterId": "phrolova",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 11.24,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 114
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-cantarella-qiuyuan-phrolova-43",
      "coordinationCaseId": "phrolova-cantarella",
      "caseRelationship": "BROAD_PARTNER_MATCH",
      "relatedReferenceIds": [
        "prydwen-phrolova-standard",
        "prydwen-qiuyuan-standard",
        "prydwen-cantarella-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "phrolova",
        "qiuyuan",
        "cantarella"
      ],
      "orderEvidenceLines": [
        72,
        78,
        84
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Phrolova startar sin off-field-fas före Qiuyuan och Cantarella. Qiuyuans Skill tillåts generera energi; den snabbare vävda varianten väljs inte. Källan stödjer denna trio, inte att byta Cantarella till Lucilla med samma tider."
      ]
    }
  },
  {
    "id": "arabwuwa-changli-brant-lupa-24",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/changli-brant-lupa-24/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 27.56,
    "builds": [
      {
        "characterId": "changli",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Blazing Brilliance",
        "refinement": 1,
        "sonataLabel": "Molten Rift"
      },
      {
        "characterId": "brant",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Unflickering Valor",
        "refinement": 1,
        "sonataLabel": "Tidebreaking Courage"
      },
      {
        "characterId": "lupa",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Wildfire Mark",
        "refinement": 1,
        "sonataLabel": "Flaming Clawprint"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 64,
        "reportedCycleSeconds": 26.91,
        "summaryLine": 66,
        "members": [
          {
            "characterId": "changli",
            "sourceActionLabel": "Basic (No Swaps)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.98,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 87
          },
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 88
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 7.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 89
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 90,
        "reportedCycleSeconds": 27.88,
        "summaryLine": 92,
        "members": [
          {
            "characterId": "changli",
            "sourceActionLabel": "Basic (No Swaps)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.98,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 101
          },
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 102
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 8.03,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 103
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 104,
        "reportedCycleSeconds": 27.88,
        "summaryLine": 106,
        "members": [
          {
            "characterId": "changli",
            "sourceActionLabel": "Basic (No Swaps)",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 11.98,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 110
          },
          {
            "characterId": "brant",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.87,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 111
          },
          {
            "characterId": "lupa",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 8.03,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 112
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-changli-brant-lupa-24",
      "coordinationCaseId": "changli-brant-lupa",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-lupa-standard",
        "prydwen-brant-standard",
        "prydwen-changli-standard"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "lupa",
        "brant",
        "changli"
      ],
      "orderEvidenceLines": [
        70,
        76,
        82
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        1,
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Ingen intern Changli-quickswap. Buffkedjan är Lupa till Brant till Changli, med förbättrad Lupa-Intro i loopen. Tiderna gäller en-Anchor Brant och denna ordning, inte andra dubbel-Intro-varianter."
      ]
    }
  },
  {
    "id": "arabwuwa-cartethyia-ciaccona-shorekeeper-38",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/cartethyia-ciaccona-shorekeeper-38/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 25.23,
    "builds": [
      {
        "characterId": "cartethyia",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Defier's Thorn",
        "refinement": 1,
        "sonataLabel": "Windward Pilgrimage"
      },
      {
        "characterId": "ciaccona",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Woodland Aria",
        "refinement": 1,
        "sonataLabel": "Gusts of Welkin"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 67,
        "reportedCycleSeconds": 24.5,
        "summaryLine": 69,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 89
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Jump Cancel",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 4.45,
            "waitSeconds": 0,
            "difficulty": 3.5,
            "sourceLine": 90
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 91
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 92,
        "reportedCycleSeconds": 25.6,
        "summaryLine": 94,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 109
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 110
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 111
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 112,
        "reportedCycleSeconds": 25.6,
        "summaryLine": 114,
        "members": [
          {
            "characterId": "cartethyia",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.99,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 118
          },
          {
            "characterId": "ciaccona",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 6.86,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 119
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 120
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-cartethyia-ciaccona-shorekeeper-38",
      "coordinationCaseId": "cartethyia-ciaccona-the-shorekeeper",
      "caseRelationship": "BROAD_TRIO_MATCH",
      "relatedReferenceIds": [
        "prydwen-cartethyia-standard",
        "prydwen-ciaccona-standard",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": [
        "the-shorekeeper",
        "ciaccona",
        "cartethyia"
      ],
      "orderEvidenceLines": [
        73,
        79,
        85
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [
        2,
        3
      ],
      "timelinePolicy": "CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY",
      "executionStyle": "SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS",
      "infoSv": [
        "Öppningen använder snabb Ciaccona med jump cancels och väljs inte som standard. Loopen är normal hastighet, 6,86 s. Den tidssatta källan använder vanlig Cartethyia-combo; Prydwen-fallet har egen multi-wave-kontext."
      ]
    }
  },
  {
    "id": "arabwuwa-jinhsi-zhezhi-shorekeeper-58",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/jinhsi-zhezhi-shorekeeper-58/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 26.98,
    "builds": [
      {
        "characterId": "jinhsi",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Ages of Harvest",
        "refinement": 1,
        "sonataLabel": "Celestial Light"
      },
      {
        "characterId": "zhezhi",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Rime-Draped Sprouts",
        "refinement": 1,
        "sonataLabel": "Moonlit Clouds"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 66,
        "reportedCycleSeconds": 30.94,
        "summaryLine": 68,
        "members": [
          {
            "characterId": "jinhsi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Opener then Double Intro",
            "fieldSeconds": 17.67,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 118
          },
          {
            "characterId": "zhezhi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.84,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 119
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Swap Zhezhi with Jinhsi",
            "sourceIntroLabel": "Normal Intro",
            "fieldSeconds": 5.43,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 120
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 121,
        "reportedCycleSeconds": 25,
        "summaryLine": 123,
        "members": [
          {
            "characterId": "jinhsi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Double Intro",
            "fieldSeconds": 12.04,
            "waitSeconds": 0.63,
            "difficulty": 0,
            "sourceLine": 127
          },
          {
            "characterId": "zhezhi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.84,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 128
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Swap",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.49,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 129
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 130,
        "reportedCycleSeconds": 25,
        "summaryLine": 132,
        "members": [
          {
            "characterId": "jinhsi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Double Intro",
            "fieldSeconds": 12.04,
            "waitSeconds": 0.63,
            "difficulty": 0,
            "sourceLine": 136
          },
          {
            "characterId": "zhezhi",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 7.84,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 137
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Swap",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.49,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 138
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-jinhsi-zhezhi-shorekeeper-58",
      "coordinationCaseId": "jinhsi-zhezhi",
      "caseRelationship": "BROAD_PARTNER_MATCH",
      "relatedReferenceIds": [
        "prydwen-jinhsi-standard",
        "prydwen-zhezhi-jinhsi-no-liberation",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": null,
      "orderEvidenceLines": [
        72,
        78,
        84,
        90,
        96,
        101,
        107,
        113
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [],
      "timelinePolicy": "AGGREGATE_ONLY_SPLIT_VISITS",
      "executionStyle": "REENTRY_REQUIRES_VISIT_TIMING",
      "infoSv": [
        "Jinhsi återkommer flera gånger; 12,04 s är hennes sammanlagda looparbete. Källan visar 0,63 s väntan. Besökstider saknas och opening/loop-boundary måste granskas före buffplacering; ingen jämn fördelning antas."
      ]
    }
  },
  {
    "id": "arabwuwa-xiangli-yao-yinlin-shorekeeper-7",
    "provider": "ARAB_WUWA",
    "url": "https://arabwuwa.com/teams/xiangli-yao-yinlin-shorekeeper-7/",
    "capturedAt": "2026-10-12",
    "sourceLastUpdated": "30 August 2026",
    "reportedAverageCycleSeconds": 23.71,
    "builds": [
      {
        "characterId": "xiangli-yao",
        "sequence": 0,
        "sourceLine": 45,
        "weaponName": "Verity's Handle",
        "refinement": 1,
        "sonataLabel": "Void Thunder"
      },
      {
        "characterId": "yinlin",
        "sequence": 0,
        "sourceLine": 51,
        "weaponName": "Stringmaster",
        "refinement": 1,
        "sonataLabel": "Moonlit Clouds"
      },
      {
        "characterId": "the-shorekeeper",
        "sequence": 0,
        "sourceLine": 57,
        "weaponName": "Stellar Symphony",
        "refinement": 1,
        "sonataLabel": "Rejuvenating Glow"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "headingLine": 67,
        "reportedCycleSeconds": 23.72,
        "summaryLine": 69,
        "members": [
          {
            "characterId": "xiangli-yao",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.1,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 95
          },
          {
            "characterId": "yinlin",
            "sourceActionLabel": "Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 4.56,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 96
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "No Intro",
            "fieldSeconds": 6.06,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 97
          }
        ]
      },
      {
        "rotationNumber": 2,
        "headingLine": 98,
        "reportedCycleSeconds": 22.41,
        "summaryLine": 100,
        "members": [
          {
            "characterId": "xiangli-yao",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.1,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 115
          },
          {
            "characterId": "yinlin",
            "sourceActionLabel": "Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 4.56,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 116
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 0,
            "difficulty": 0,
            "sourceLine": 117
          }
        ]
      },
      {
        "rotationNumber": 3,
        "headingLine": 118,
        "reportedCycleSeconds": 25,
        "summaryLine": 120,
        "members": [
          {
            "characterId": "xiangli-yao",
            "sourceActionLabel": "Basic",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 13.1,
            "waitSeconds": 0,
            "difficulty": 1,
            "sourceLine": 124
          },
          {
            "characterId": "yinlin",
            "sourceActionLabel": "Swap",
            "sourceIntroLabel": "Intro",
            "fieldSeconds": 4.56,
            "waitSeconds": 0,
            "difficulty": 2,
            "sourceLine": 125
          },
          {
            "characterId": "the-shorekeeper",
            "sourceActionLabel": "Basic - No Dodge",
            "sourceIntroLabel": "Enhanced Intro",
            "fieldSeconds": 4.75,
            "waitSeconds": 2.59,
            "difficulty": 0,
            "sourceLine": 126
          }
        ]
      }
    ],
    "review": {
      "sourceId": "arabwuwa-xiangli-yao-yinlin-shorekeeper-7",
      "coordinationCaseId": null,
      "caseRelationship": "ADDITIONAL_RESEARCH_TRIO",
      "relatedReferenceIds": [
        "prydwen-xiangli-yao-standard",
        "prydwen-yinlin-standard",
        "prydwen-the-shorekeeper-concerto-r1-loop"
      ],
      "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
      "modeRequirements": {},
      "actorOrder": null,
      "orderEvidenceLines": [
        73,
        79,
        85,
        91
      ],
      "orderBasis": "WRITTEN_TEAM_RECIPE_REVIEW",
      "eligibleStandardRotationNumbers": [],
      "timelinePolicy": "AGGREGATE_ONLY_SPLIT_VISITS",
      "executionStyle": "REENTRY_REQUIRES_VISIT_TIMING",
      "infoSv": [
        "Yinlin/Shorekeeper har återinträden. Källan varnar själv för att andra varvet, 22,41 s, är för kort för Shorekeepers Liberation; tredje varvet behöver 2,59 s väntan. Detta är ett motexempel och väljs inte som hållbar standardloop."
      ]
    }
  }
] as const;
export const STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE: readonly TeamTimingCaseCoverage[] = [
  {
    "coordinationCaseId": "augusta-iuno-shorekeeper",
    "sourceIds": [
      "arabwuwa-augusta-iuno-shorekeeper-35"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "hsin-jinhsi-shorekeeper-unison",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "hsin-rover-electro-buling-flare",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "hsin-rover-electro-suisui-flare",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "aemeath-lynae-mornye",
    "sourceIds": [
      "arabwuwa-aemeath-lynae-mornye-86"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "aemeath-changli-quickswap",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Avancerad quickswap ligger utanför denna standardtiming-batch."
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-rover-aero",
    "sourceIds": [
      "arabwuwa-cartethyia-ciaccona-rover-aero-40"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "cartethyia-chisa-rover-aero",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "cartethyia-low-erosion",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "brant-lupa-mornye-dps",
    "sourceIds": [
      "arabwuwa-brant-lupa-mornye-84"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "changli-brant-lupa",
    "sourceIds": [
      "arabwuwa-changli-brant-lupa-24"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "zani-phoebe-confession",
    "sourceIds": [
      "arabwuwa-zani-phoebe-shorekeeper-33"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "phrolova-lucilla-qiuyuan",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Publicerad Phrolova/Qiuyuan/Cantarella-trio hittad, men Lucilla kan inte ersätta Cantarella med kopierad fälttid."
  },
  {
    "coordinationCaseId": "phrolova-cantarella",
    "sourceIds": [
      "arabwuwa-cantarella-qiuyuan-phrolova-43"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "jinhsi-zhezhi",
    "sourceIds": [
      "arabwuwa-jinhsi-zhezhi-shorekeeper-58"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-chisa",
    "sourceIds": [
      "arabwuwa-cartethyia-ciaccona-chisa-50"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-the-shorekeeper",
    "sourceIds": [
      "arabwuwa-cartethyia-ciaccona-shorekeeper-38"
    ],
    "status": "RELATED_PUBLISHED_TIMING",
    "infoSv": "Publicerad timing hittad för relaterad variant; skill-order och gear får inte antas identiska."
  },
  {
    "coordinationCaseId": "rover-havoc-danjin-hypercarry",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  },
  {
    "coordinationCaseId": "rover-havoc-danjin-shared-dps",
    "sourceIds": [],
    "status": "NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH",
    "infoSv": "Ingen passande publicerad standardtiming identifierad i denna avgränsade sökning; personlig rotationstid kopieras inte mellan team."
  }
] as const;
