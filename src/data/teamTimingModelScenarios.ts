// Generated timing-only scenarios; source traces stay in evidence.
export const TEAM_TIMING_MODEL_REVIEW = {
  "reviewedAt": "2026-10-12",
  "reviewArtifact": "data/source/team-timing-model-review-2026-10-12.json",
  "reviewSha256": "0dbe1544c02352c0af42f53be3ee44431fdbc34e59556e6d96bccaaa66e701e4",
  "evidenceArtifact": "data/source/team-timing-model-evidence-2026-10-12.json",
  "evidenceSha256": "c2f0883cbfb09982fedfb746e73391d3313930173abec85b22c869de6edc0329",
  "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
  "authority": "REFERENCE_MODEL_NOT_MEASURED_GAMEPLAY_OR_CANONICAL_MECHANICS",
  "scope": "DECLARED_TIMING_SCENARIOS_NOT_GAMEPLAY_MEASUREMENTS_OR_DPS"
} as const;
export const TEAM_TIMING_MODEL_SCENARIOS = [
  {
    "id": "standard-model-hsin-jinhsi-shorekeeper-unison",
    "coordinationCaseId": "hsin-jinhsi-shorekeeper-unison",
    "characterIds": [
      "jinhsi",
      "hsin",
      "the-shorekeeper"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-the-shorekeeper-concerto-r1-loop",
      "prydwen-the-shorekeeper-no-concerto-alternating-loop",
      "prydwen-jinhsi-standard",
      "prydwen-hsin-unison"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/jinhsi.ts",
      "src/resonators/electro/hsin.ts",
      "src/resonators/spectro/shorekeeper.ts"
    ],
    "infoSv": [
      "Två Jinhsi- och två Hsin-besök. Cykeln stängs med nästa Jinhsi-Intro, som särredovisas och inte blir ännu en full skadefas. Källmodellen är ett publicerat beräkningsscenario, inte live-uppmätta frames."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Jinhsi",
        "mode": null,
        "sequence": 0,
        "weapon": "Ages of Harvest R1",
        "echo": "Jué",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "jinhsi"
      },
      {
        "actor": "Hsin",
        "mode": "Resonance Mode - Unison",
        "sequence": 0,
        "weapon": "Blooming Jadehaven R1",
        "echo": "Reminiscence: Suhsin",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "hsin"
      },
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1660,
        "visits": [
          {
            "characterId": "jinhsi",
            "startFrame": 0,
            "endFrame": 248,
            "durationFrames": 248,
            "workFrames": 248,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "hsin",
            "startFrame": 248,
            "endFrame": 581,
            "durationFrames": 333,
            "workFrames": 333,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 581,
            "endFrame": 881,
            "durationFrames": 300,
            "workFrames": 300,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 881,
            "endFrame": 1235,
            "durationFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "hsin",
            "startFrame": 1235,
            "endFrame": 1600,
            "durationFrames": 365,
            "workFrames": 365,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1600,
            "endFrame": 1660,
            "durationFrames": 60,
            "workFrames": 60,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "jinhsi",
            "fieldFrames": 662,
            "workFrames": 662,
            "waitFrames": 0,
            "visitCount": 3
          },
          {
            "characterId": "hsin",
            "fieldFrames": 698,
            "workFrames": 698,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 300,
            "workFrames": 300,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1712,
        "visits": [
          {
            "characterId": "jinhsi",
            "startFrame": 0,
            "endFrame": 303,
            "durationFrames": 303,
            "workFrames": 302,
            "waitFrames": 1,
            "waits": [
              {
                "atFrame": 0,
                "durationFrames": 1
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 303,
            "endFrame": 636,
            "durationFrames": 333,
            "workFrames": 333,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 636,
            "endFrame": 932,
            "durationFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 932,
            "endFrame": 1286,
            "durationFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "hsin",
            "startFrame": 1286,
            "endFrame": 1652,
            "durationFrames": 366,
            "workFrames": 365,
            "waitFrames": 1,
            "waits": [
              {
                "atFrame": 1639,
                "durationFrames": 1
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1652,
            "endFrame": 1712,
            "durationFrames": 60,
            "workFrames": 60,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "jinhsi",
            "fieldFrames": 717,
            "workFrames": 716,
            "waitFrames": 1,
            "visitCount": 3
          },
          {
            "characterId": "hsin",
            "fieldFrames": 699,
            "workFrames": 698,
            "waitFrames": 1,
            "visitCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1711,
        "visits": [
          {
            "characterId": "jinhsi",
            "startFrame": 0,
            "endFrame": 302,
            "durationFrames": 302,
            "workFrames": 302,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 302,
            "endFrame": 635,
            "durationFrames": 333,
            "workFrames": 333,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 635,
            "endFrame": 931,
            "durationFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 931,
            "endFrame": 1285,
            "durationFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "hsin",
            "startFrame": 1285,
            "endFrame": 1651,
            "durationFrames": 366,
            "workFrames": 365,
            "waitFrames": 1,
            "waits": [
              {
                "atFrame": 1638,
                "durationFrames": 1
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1651,
            "endFrame": 1711,
            "durationFrames": 60,
            "workFrames": 60,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "jinhsi",
            "fieldFrames": 716,
            "workFrames": 716,
            "waitFrames": 0,
            "visitCount": 3
          },
          {
            "characterId": "hsin",
            "fieldFrames": 699,
            "workFrames": 698,
            "waitFrames": 1,
            "visitCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1711,
        "visits": [
          {
            "characterId": "jinhsi",
            "startFrame": 0,
            "endFrame": 302,
            "durationFrames": 302,
            "workFrames": 302,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "hsin",
            "startFrame": 302,
            "endFrame": 635,
            "durationFrames": 333,
            "workFrames": 333,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 635,
            "endFrame": 931,
            "durationFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 931,
            "endFrame": 1285,
            "durationFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "hsin",
            "startFrame": 1285,
            "endFrame": 1651,
            "durationFrames": 366,
            "workFrames": 365,
            "waitFrames": 1,
            "waits": [
              {
                "atFrame": 1638,
                "durationFrames": 1
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1651,
            "endFrame": 1711,
            "durationFrames": 60,
            "workFrames": 60,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "jinhsi",
            "fieldFrames": 716,
            "workFrames": 716,
            "waitFrames": 0,
            "visitCount": 3
          },
          {
            "characterId": "hsin",
            "fieldFrames": 699,
            "workFrames": 698,
            "waitFrames": 1,
            "visitCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 28.522222222222222,
    "meanMemberSeconds": [
      {
        "characterId": "jinhsi",
        "fieldSeconds": 11.938888888888888,
        "workSeconds": 11.933333333333334,
        "waitSeconds": 0.005555555555555556
      },
      {
        "characterId": "hsin",
        "fieldSeconds": 11.65,
        "workSeconds": 11.633333333333333,
        "waitSeconds": 0.016666666666666666
      },
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-hsin-rover-electro-buling-flare",
    "coordinationCaseId": "hsin-rover-electro-buling-flare",
    "characterIds": [
      "buling",
      "rover-electro",
      "hsin"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-buling-no-intro",
      "prydwen-rover-electro-standard",
      "prydwen-hsin-electro-flare"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/electro/buling.ts",
      "src/resonators/electro/rover_electro.ts",
      "src/resonators/electro/hsin.ts"
    ],
    "infoSv": [
      "Buling → Electro Rover → Hsin. Buling och Rover är S6; Hsin S0. Modellens Heart/form-villkor passerar för denna variant."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Buling",
        "mode": null,
        "sequence": 6,
        "weapon": "Variation R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 CD ER ER atk atk",
        "highSubs": false,
        "characterId": "buling"
      },
      {
        "actor": "Electro Rover",
        "mode": null,
        "sequence": 6,
        "weapon": "Emerald of Genesis R1",
        "echo": "Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "rover-electro"
      },
      {
        "actor": "Hsin",
        "mode": "Resonance Mode - Electro Flare",
        "sequence": 0,
        "weapon": "Blooming Jadehaven R1",
        "echo": "Reminiscence: Suhsin",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "hsin"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1664,
        "visits": [
          {
            "characterId": "buling",
            "startFrame": 0,
            "endFrame": 359,
            "durationFrames": 359,
            "workFrames": 359,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "rover-electro",
            "startFrame": 359,
            "endFrame": 836,
            "durationFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 836,
            "endFrame": 1584,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "buling",
            "startFrame": 1584,
            "endFrame": 1664,
            "durationFrames": 80,
            "workFrames": 80,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "buling",
            "fieldFrames": 439,
            "workFrames": 439,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1664,
        "visits": [
          {
            "characterId": "buling",
            "startFrame": 0,
            "endFrame": 359,
            "durationFrames": 359,
            "workFrames": 359,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "rover-electro",
            "startFrame": 359,
            "endFrame": 836,
            "durationFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 836,
            "endFrame": 1584,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "buling",
            "startFrame": 1584,
            "endFrame": 1664,
            "durationFrames": 80,
            "workFrames": 80,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "buling",
            "fieldFrames": 439,
            "workFrames": 439,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1664,
        "visits": [
          {
            "characterId": "buling",
            "startFrame": 0,
            "endFrame": 359,
            "durationFrames": 359,
            "workFrames": 359,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "rover-electro",
            "startFrame": 359,
            "endFrame": 836,
            "durationFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 836,
            "endFrame": 1584,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "buling",
            "startFrame": 1584,
            "endFrame": 1664,
            "durationFrames": 80,
            "workFrames": 80,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "buling",
            "fieldFrames": 439,
            "workFrames": 439,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1664,
        "visits": [
          {
            "characterId": "buling",
            "startFrame": 0,
            "endFrame": 359,
            "durationFrames": 359,
            "workFrames": 359,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "rover-electro",
            "startFrame": 359,
            "endFrame": 836,
            "durationFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 836,
            "endFrame": 1584,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "buling",
            "startFrame": 1584,
            "endFrame": 1664,
            "durationFrames": 80,
            "workFrames": 80,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "buling",
            "fieldFrames": 439,
            "workFrames": 439,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 27.733333333333334,
    "meanMemberSeconds": [
      {
        "characterId": "buling",
        "fieldSeconds": 7.316666666666666,
        "workSeconds": 7.316666666666666,
        "waitSeconds": 0
      },
      {
        "characterId": "rover-electro",
        "fieldSeconds": 7.95,
        "workSeconds": 7.95,
        "waitSeconds": 0
      },
      {
        "characterId": "hsin",
        "fieldSeconds": 12.466666666666667,
        "workSeconds": 12.466666666666667,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-hsin-rover-electro-suisui-flare",
    "coordinationCaseId": "hsin-rover-electro-suisui-flare",
    "characterIds": [
      "suisui",
      "rover-electro",
      "hsin"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-suisui-standard",
      "prydwen-rover-electro-standard",
      "prydwen-hsin-electro-flare"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/glacio/suisui.ts",
      "src/resonators/electro/rover_electro.ts",
      "src/resonators/electro/hsin.ts"
    ],
    "infoSv": [
      "Suisui → Electro Rover → Hsin. Suisui och Rover är S6; Hsin S0. Suisuis öppning är längre än loopen."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Suisui",
        "mode": null,
        "sequence": 6,
        "weapon": "Firstlight's Herald R1",
        "echo": "Forbidden Bastion",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "suisui"
      },
      {
        "actor": "Electro Rover",
        "mode": null,
        "sequence": 6,
        "weapon": "Emerald of Genesis R1",
        "echo": "Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "rover-electro"
      },
      {
        "actor": "Hsin",
        "mode": "Resonance Mode - Electro Flare",
        "sequence": 0,
        "weapon": "Blooming Jadehaven R1",
        "echo": "Reminiscence: Suhsin",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "hsin"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1805,
        "visits": [
          {
            "characterId": "suisui",
            "startFrame": 0,
            "endFrame": 502,
            "durationFrames": 502,
            "workFrames": 502,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "rover-electro",
            "startFrame": 502,
            "endFrame": 979,
            "durationFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 979,
            "endFrame": 1727,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "suisui",
            "startFrame": 1727,
            "endFrame": 1805,
            "durationFrames": 78,
            "workFrames": 78,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "suisui",
            "fieldFrames": 580,
            "workFrames": 580,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 477,
            "workFrames": 477,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1605,
        "visits": [
          {
            "characterId": "suisui",
            "startFrame": 0,
            "endFrame": 303,
            "durationFrames": 303,
            "workFrames": 303,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "rover-electro",
            "startFrame": 303,
            "endFrame": 779,
            "durationFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 779,
            "endFrame": 1527,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "suisui",
            "startFrame": 1527,
            "endFrame": 1605,
            "durationFrames": 78,
            "workFrames": 78,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "suisui",
            "fieldFrames": 381,
            "workFrames": 381,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1605,
        "visits": [
          {
            "characterId": "suisui",
            "startFrame": 0,
            "endFrame": 303,
            "durationFrames": 303,
            "workFrames": 303,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "rover-electro",
            "startFrame": 303,
            "endFrame": 779,
            "durationFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 779,
            "endFrame": 1527,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "suisui",
            "startFrame": 1527,
            "endFrame": 1605,
            "durationFrames": 78,
            "workFrames": 78,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "suisui",
            "fieldFrames": 381,
            "workFrames": 381,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1605,
        "visits": [
          {
            "characterId": "suisui",
            "startFrame": 0,
            "endFrame": 303,
            "durationFrames": 303,
            "workFrames": 303,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "rover-electro",
            "startFrame": 303,
            "endFrame": 779,
            "durationFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "hsin",
            "startFrame": 779,
            "endFrame": 1527,
            "durationFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "suisui",
            "startFrame": 1527,
            "endFrame": 1605,
            "durationFrames": 78,
            "workFrames": 78,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "suisui",
            "fieldFrames": 381,
            "workFrames": 381,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-electro",
            "fieldFrames": 476,
            "workFrames": 476,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "hsin",
            "fieldFrames": 748,
            "workFrames": 748,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 26.75,
    "meanMemberSeconds": [
      {
        "characterId": "suisui",
        "fieldSeconds": 6.35,
        "workSeconds": 6.35,
        "waitSeconds": 0
      },
      {
        "characterId": "rover-electro",
        "fieldSeconds": 7.933333333333334,
        "workSeconds": 7.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "hsin",
        "fieldSeconds": 12.466666666666667,
        "workSeconds": 12.466666666666667,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-aemeath-changli-quickswap",
    "coordinationCaseId": "aemeath-changli-quickswap",
    "characterIds": [
      "the-shorekeeper",
      "changli",
      "aemeath"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "simple-sequential-tune-rupture",
    "contextChangeRequired": true,
    "relatedReferenceIds": [
      "prydwen-changli-standard",
      "prydwen-aemeath-changli-quickswap"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/fusion/changli.ts",
      "src/resonators/fusion/aemeath.ts"
    ],
    "infoSv": [
      "Ny standardkontext: Shorekeeper → Changli → Aemeath i Tune Rupture, utan avancerad intern quickswap. Detta ersätter inte timing för den gamla quickswap-guiden."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Changli",
        "mode": null,
        "sequence": 0,
        "weapon": "Blazing Brilliance R1",
        "echo": "Nightmare: Inferno Rider",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "changli"
      },
      {
        "actor": "Aemeath",
        "mode": "Resonance Mode - Tune Rupture",
        "sequence": 0,
        "weapon": "Everbright Polestar R1",
        "echo": "Sigillum",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "aemeath"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1932,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 377,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "changli",
            "startFrame": 377,
            "endFrame": 1116,
            "durationFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "aemeath",
            "startFrame": 1116,
            "endFrame": 1851,
            "durationFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1851,
            "endFrame": 1932,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "changli",
            "fieldFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "aemeath",
            "fieldFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1770,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "changli",
            "startFrame": 215,
            "endFrame": 954,
            "durationFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "aemeath",
            "startFrame": 954,
            "endFrame": 1689,
            "durationFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1689,
            "endFrame": 1770,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "changli",
            "fieldFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "aemeath",
            "fieldFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1770,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "changli",
            "startFrame": 215,
            "endFrame": 954,
            "durationFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "aemeath",
            "startFrame": 954,
            "endFrame": 1689,
            "durationFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1689,
            "endFrame": 1770,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "changli",
            "fieldFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "aemeath",
            "fieldFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1770,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "changli",
            "startFrame": 215,
            "endFrame": 954,
            "durationFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "aemeath",
            "startFrame": 954,
            "endFrame": 1689,
            "durationFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1689,
            "endFrame": 1770,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "changli",
            "fieldFrames": 739,
            "workFrames": 739,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "aemeath",
            "fieldFrames": 735,
            "workFrames": 735,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 29.5,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "changli",
        "fieldSeconds": 12.316666666666666,
        "workSeconds": 12.316666666666666,
        "waitSeconds": 0
      },
      {
        "characterId": "aemeath",
        "fieldSeconds": 12.25,
        "workSeconds": 12.25,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-cartethyia-chisa-rover-aero",
    "coordinationCaseId": "cartethyia-chisa-rover-aero",
    "characterIds": [
      "chisa",
      "rover-aero",
      "cartethyia"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-chisa-standard",
      "prydwen-rover-aero-standard",
      "prydwen-cartethyia-standard"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/havoc/chisa.ts",
      "src/resonators/aero/rover_aero.ts",
      "src/resonators/aero/cartethyia.ts"
    ],
    "infoSv": [
      "Chisa → Aero Rover → Cartethyia. Rover är S6. Källmodellen använder en sammanhängande Cartethyia-fas; guidekommandon och setval får inte antas identiska."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Chisa",
        "mode": null,
        "sequence": 0,
        "weapon": "Kumokiri R1",
        "echo": "Reminiscence: Threnodian - Leviathan",
        "mainstat": "43311 CD ER ER atk atk",
        "highSubs": false,
        "characterId": "chisa"
      },
      {
        "actor": "Aero Rover",
        "mode": null,
        "sequence": 6,
        "weapon": "Bloodpact's Pledge R5",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "rover-aero"
      },
      {
        "actor": "Cartethyia",
        "mode": null,
        "sequence": 0,
        "weapon": "Defier's Thorn R1",
        "echo": "Reminiscence: Fleurdelys",
        "mainstat": "43311 CR Aero Aero hp hp",
        "highSubs": false,
        "characterId": "cartethyia"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 2112,
        "visits": [
          {
            "characterId": "chisa",
            "startFrame": 0,
            "endFrame": 544,
            "durationFrames": 544,
            "workFrames": 544,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 12
          },
          {
            "characterId": "rover-aero",
            "startFrame": 544,
            "endFrame": 1122,
            "durationFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "cartethyia",
            "startFrame": 1122,
            "endFrame": 2057,
            "durationFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 19
          },
          {
            "characterId": "chisa",
            "startFrame": 2057,
            "endFrame": 2112,
            "durationFrames": 55,
            "workFrames": 55,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "chisa",
            "fieldFrames": 599,
            "workFrames": 599,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-aero",
            "fieldFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 2027,
        "visits": [
          {
            "characterId": "chisa",
            "startFrame": 0,
            "endFrame": 460,
            "durationFrames": 460,
            "workFrames": 460,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "rover-aero",
            "startFrame": 460,
            "endFrame": 1037,
            "durationFrames": 577,
            "workFrames": 577,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "cartethyia",
            "startFrame": 1037,
            "endFrame": 1972,
            "durationFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 19
          },
          {
            "characterId": "chisa",
            "startFrame": 1972,
            "endFrame": 2027,
            "durationFrames": 55,
            "workFrames": 55,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "chisa",
            "fieldFrames": 515,
            "workFrames": 515,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-aero",
            "fieldFrames": 577,
            "workFrames": 577,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 2028,
        "visits": [
          {
            "characterId": "chisa",
            "startFrame": 0,
            "endFrame": 460,
            "durationFrames": 460,
            "workFrames": 460,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "rover-aero",
            "startFrame": 460,
            "endFrame": 1038,
            "durationFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "cartethyia",
            "startFrame": 1038,
            "endFrame": 1973,
            "durationFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 19
          },
          {
            "characterId": "chisa",
            "startFrame": 1973,
            "endFrame": 2028,
            "durationFrames": 55,
            "workFrames": 55,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "chisa",
            "fieldFrames": 515,
            "workFrames": 515,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-aero",
            "fieldFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 2028,
        "visits": [
          {
            "characterId": "chisa",
            "startFrame": 0,
            "endFrame": 460,
            "durationFrames": 460,
            "workFrames": 460,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "rover-aero",
            "startFrame": 460,
            "endFrame": 1038,
            "durationFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "cartethyia",
            "startFrame": 1038,
            "endFrame": 1973,
            "durationFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 19
          },
          {
            "characterId": "chisa",
            "startFrame": 1973,
            "endFrame": 2028,
            "durationFrames": 55,
            "workFrames": 55,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "chisa",
            "fieldFrames": 515,
            "workFrames": 515,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "rover-aero",
            "fieldFrames": 578,
            "workFrames": 578,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 935,
            "workFrames": 935,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 33.794444444444444,
    "meanMemberSeconds": [
      {
        "characterId": "chisa",
        "fieldSeconds": 8.583333333333334,
        "workSeconds": 8.583333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "rover-aero",
        "fieldSeconds": 9.627777777777778,
        "workSeconds": 9.627777777777778,
        "waitSeconds": 0
      },
      {
        "characterId": "cartethyia",
        "fieldSeconds": 15.583333333333334,
        "workSeconds": 15.583333333333334,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-cartethyia-low-erosion",
    "coordinationCaseId": "cartethyia-low-erosion",
    "characterIds": [
      "the-shorekeeper",
      "sanhua",
      "cartethyia"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "concrete-sanhua-low-erosion",
    "contextChangeRequired": true,
    "relatedReferenceIds": [
      "prydwen-cartethyia-low-aero-erosion"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/glacio/sanhua.ts",
      "src/resonators/aero/cartethyia.ts"
    ],
    "infoSv": [
      "Konkret alternativ utan Ciaccona: Shorekeeper/Sanhua/Cartethyia. En enklare sammanhängande source-model combo används i stället för guidens upprepade formbyten. Lägre Erosion-stackar ger annan skadeverkan; här beräknas bara tid."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Sanhua",
        "mode": null,
        "sequence": 6,
        "weapon": "Blazing Brilliance R1",
        "echo": "Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "sanhua"
      },
      {
        "actor": "Cartethyia",
        "mode": null,
        "sequence": 0,
        "weapon": "Defier's Thorn R1",
        "echo": "Reminiscence: Fleurdelys",
        "mainstat": "43311 CR Aero Aero hp hp",
        "highSubs": false,
        "characterId": "cartethyia"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1662,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 377,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "sanhua",
            "startFrame": 377,
            "endFrame": 617,
            "durationFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "cartethyia",
            "startFrame": 617,
            "endFrame": 1581,
            "durationFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "waits": [
              {
                "atFrame": 1540,
                "durationFrames": 29
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 20
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1581,
            "endFrame": 1662,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "sanhua",
            "fieldFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "sanhua",
            "startFrame": 215,
            "endFrame": 455,
            "durationFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "cartethyia",
            "startFrame": 455,
            "endFrame": 1419,
            "durationFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "waits": [
              {
                "atFrame": 1378,
                "durationFrames": 29
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 20
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "sanhua",
            "fieldFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "sanhua",
            "startFrame": 215,
            "endFrame": 455,
            "durationFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "cartethyia",
            "startFrame": 455,
            "endFrame": 1419,
            "durationFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "waits": [
              {
                "atFrame": 1378,
                "durationFrames": 29
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 20
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "sanhua",
            "fieldFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "sanhua",
            "startFrame": 215,
            "endFrame": 455,
            "durationFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 5
          },
          {
            "characterId": "cartethyia",
            "startFrame": 455,
            "endFrame": 1419,
            "durationFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "waits": [
              {
                "atFrame": 1378,
                "durationFrames": 29
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 20
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "sanhua",
            "fieldFrames": 240,
            "workFrames": 240,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "cartethyia",
            "fieldFrames": 964,
            "workFrames": 935,
            "waitFrames": 29,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 25,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "sanhua",
        "fieldSeconds": 4,
        "workSeconds": 4,
        "waitSeconds": 0
      },
      {
        "characterId": "cartethyia",
        "fieldSeconds": 16.066666666666666,
        "workSeconds": 15.583333333333334,
        "waitSeconds": 0.48333333333333334
      }
    ]
  },
  {
    "id": "standard-model-phrolova-lucilla-qiuyuan",
    "coordinationCaseId": "phrolova-lucilla-qiuyuan",
    "characterIds": [
      "phrolova",
      "qiuyuan",
      "lucilla"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-phrolova-standard",
      "prydwen-qiuyuan-standard",
      "prydwen-lucilla-phrolova"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/havoc/phrolova.ts",
      "src/resonators/aero/qiuyuan.ts",
      "src/resonators/glacio/lucilla.ts"
    ],
    "infoSv": [
      "Phrolova → Qiuyuan → Lucilla. En sammanhängande Echo-mode Lucilla-fas används. Hecates off-field-arbete är inte en extra aktiv fas."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Phrolova",
        "mode": null,
        "sequence": 0,
        "weapon": "Lethean Elegy R1",
        "echo": "Nightmare: Hecate",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "phrolova"
      },
      {
        "actor": "Qiuyuan",
        "mode": null,
        "sequence": 0,
        "weapon": "Emerald Sentence R1",
        "echo": "Reminiscence: Fenrico",
        "mainstat": "43311 CR ER ER atk atk",
        "highSubs": false,
        "characterId": "qiuyuan"
      },
      {
        "actor": "Lucilla",
        "mode": "Resonance Mode - Echo",
        "sequence": 0,
        "weapon": "Freeze Frame R1",
        "echo": "Bell-Borne Geochelone",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "lucilla"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1774,
        "visits": [
          {
            "characterId": "lucilla",
            "startFrame": 0,
            "endFrame": 119,
            "durationFrames": 119,
            "workFrames": 119,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 2
          },
          {
            "characterId": "phrolova",
            "startFrame": 119,
            "endFrame": 731,
            "durationFrames": 612,
            "workFrames": 612,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 14
          },
          {
            "characterId": "qiuyuan",
            "startFrame": 731,
            "endFrame": 1154,
            "durationFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "lucilla",
            "startFrame": 1154,
            "endFrame": 1681,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phrolova",
            "startFrame": 1681,
            "endFrame": 1774,
            "durationFrames": 93,
            "workFrames": 93,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "phrolova",
            "fieldFrames": 705,
            "workFrames": 705,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "qiuyuan",
            "fieldFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "lucilla",
            "fieldFrames": 646,
            "workFrames": 646,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1619,
        "visits": [
          {
            "characterId": "phrolova",
            "startFrame": 0,
            "endFrame": 576,
            "durationFrames": 576,
            "workFrames": 576,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "qiuyuan",
            "startFrame": 576,
            "endFrame": 999,
            "durationFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "lucilla",
            "startFrame": 999,
            "endFrame": 1526,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phrolova",
            "startFrame": 1526,
            "endFrame": 1619,
            "durationFrames": 93,
            "workFrames": 93,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "phrolova",
            "fieldFrames": 669,
            "workFrames": 669,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "qiuyuan",
            "fieldFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "lucilla",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1619,
        "visits": [
          {
            "characterId": "phrolova",
            "startFrame": 0,
            "endFrame": 576,
            "durationFrames": 576,
            "workFrames": 576,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "qiuyuan",
            "startFrame": 576,
            "endFrame": 999,
            "durationFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "lucilla",
            "startFrame": 999,
            "endFrame": 1526,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phrolova",
            "startFrame": 1526,
            "endFrame": 1619,
            "durationFrames": 93,
            "workFrames": 93,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "phrolova",
            "fieldFrames": 669,
            "workFrames": 669,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "qiuyuan",
            "fieldFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "lucilla",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1619,
        "visits": [
          {
            "characterId": "phrolova",
            "startFrame": 0,
            "endFrame": 576,
            "durationFrames": 576,
            "workFrames": 576,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "qiuyuan",
            "startFrame": 576,
            "endFrame": 999,
            "durationFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "lucilla",
            "startFrame": 999,
            "endFrame": 1526,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phrolova",
            "startFrame": 1526,
            "endFrame": 1619,
            "durationFrames": 93,
            "workFrames": 93,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "phrolova",
            "fieldFrames": 669,
            "workFrames": 669,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "qiuyuan",
            "fieldFrames": 423,
            "workFrames": 423,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "lucilla",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 26.983333333333334,
    "meanMemberSeconds": [
      {
        "characterId": "phrolova",
        "fieldSeconds": 11.15,
        "workSeconds": 11.15,
        "waitSeconds": 0
      },
      {
        "characterId": "qiuyuan",
        "fieldSeconds": 7.05,
        "workSeconds": 7.05,
        "waitSeconds": 0
      },
      {
        "characterId": "lucilla",
        "fieldSeconds": 8.783333333333333,
        "workSeconds": 8.783333333333333,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-brant-lupa-mornye-dps",
    "coordinationCaseId": "brant-lupa-mornye-dps",
    "characterIds": [
      "mornye",
      "lupa",
      "brant"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-mornye-standard",
      "prydwen-lupa-standard",
      "prydwen-brant-main-dps-double-forte"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/fusion/mornye.ts",
      "src/resonators/fusion/lupa.ts",
      "src/resonators/fusion/brant.ts"
    ],
    "infoSv": [
      "Dubbel Forte med Brant före och efter Lupa, inte en-Anchor-tabellens 7,87 s. Det avsiktliga mellanbytet behålls; snäva avbrott återställs till fulla source-animationer."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Mornye",
        "mode": null,
        "sequence": 0,
        "weapon": "Starfield Calibrator R1",
        "echo": "Reactor Husk",
        "mainstat": "43311 DEF ER ER def def",
        "highSubs": false,
        "characterId": "mornye"
      },
      {
        "actor": "Lupa",
        "mode": null,
        "sequence": 0,
        "weapon": "Wildfire Mark R1",
        "echo": "Lioness of Glory",
        "mainstat": "43311 CR ER ER atk atk",
        "highSubs": false,
        "characterId": "lupa"
      },
      {
        "actor": "Brant",
        "mode": null,
        "sequence": 0,
        "weapon": "Unflickering Valor R1",
        "echo": "Dragon of Dirge",
        "mainstat": "43311 CR ER ER atk atk",
        "highSubs": false,
        "characterId": "brant"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 2340,
        "visits": [
          {
            "characterId": "mornye",
            "startFrame": 0,
            "endFrame": 464,
            "durationFrames": 464,
            "workFrames": 464,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "brant",
            "startFrame": 464,
            "endFrame": 952,
            "durationFrames": 488,
            "workFrames": 488,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "lupa",
            "startFrame": 952,
            "endFrame": 1439,
            "durationFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "brant",
            "startFrame": 1439,
            "endFrame": 2235,
            "durationFrames": 796,
            "workFrames": 796,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "mornye",
            "startFrame": 2235,
            "endFrame": 2340,
            "durationFrames": 105,
            "workFrames": 105,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "mornye",
            "fieldFrames": 569,
            "workFrames": 569,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "lupa",
            "fieldFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "brant",
            "fieldFrames": 1284,
            "workFrames": 1284,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 2125,
        "visits": [
          {
            "characterId": "mornye",
            "startFrame": 0,
            "endFrame": 249,
            "durationFrames": 249,
            "workFrames": 249,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "brant",
            "startFrame": 249,
            "endFrame": 737,
            "durationFrames": 488,
            "workFrames": 488,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "lupa",
            "startFrame": 737,
            "endFrame": 1224,
            "durationFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "brant",
            "startFrame": 1224,
            "endFrame": 2020,
            "durationFrames": 796,
            "workFrames": 796,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "mornye",
            "startFrame": 2020,
            "endFrame": 2125,
            "durationFrames": 105,
            "workFrames": 105,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "mornye",
            "fieldFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "lupa",
            "fieldFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "brant",
            "fieldFrames": 1284,
            "workFrames": 1284,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 2125,
        "visits": [
          {
            "characterId": "mornye",
            "startFrame": 0,
            "endFrame": 249,
            "durationFrames": 249,
            "workFrames": 249,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "brant",
            "startFrame": 249,
            "endFrame": 737,
            "durationFrames": 488,
            "workFrames": 488,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "lupa",
            "startFrame": 737,
            "endFrame": 1224,
            "durationFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "brant",
            "startFrame": 1224,
            "endFrame": 2020,
            "durationFrames": 796,
            "workFrames": 796,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "mornye",
            "startFrame": 2020,
            "endFrame": 2125,
            "durationFrames": 105,
            "workFrames": 105,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "mornye",
            "fieldFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "lupa",
            "fieldFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "brant",
            "fieldFrames": 1284,
            "workFrames": 1284,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 2125,
        "visits": [
          {
            "characterId": "mornye",
            "startFrame": 0,
            "endFrame": 249,
            "durationFrames": 249,
            "workFrames": 249,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 7
          },
          {
            "characterId": "brant",
            "startFrame": 249,
            "endFrame": 737,
            "durationFrames": 488,
            "workFrames": 488,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "lupa",
            "startFrame": 737,
            "endFrame": 1224,
            "durationFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "brant",
            "startFrame": 1224,
            "endFrame": 2020,
            "durationFrames": 796,
            "workFrames": 796,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 11
          },
          {
            "characterId": "mornye",
            "startFrame": 2020,
            "endFrame": 2125,
            "durationFrames": 105,
            "workFrames": 105,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "mornye",
            "fieldFrames": 354,
            "workFrames": 354,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "lupa",
            "fieldFrames": 487,
            "workFrames": 487,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "brant",
            "fieldFrames": 1284,
            "workFrames": 1284,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 35.416666666666664,
    "meanMemberSeconds": [
      {
        "characterId": "mornye",
        "fieldSeconds": 5.9,
        "workSeconds": 5.9,
        "waitSeconds": 0
      },
      {
        "characterId": "lupa",
        "fieldSeconds": 8.116666666666667,
        "workSeconds": 8.116666666666667,
        "waitSeconds": 0
      },
      {
        "characterId": "brant",
        "fieldSeconds": 21.4,
        "workSeconds": 21.4,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-jinhsi-zhezhi",
    "coordinationCaseId": "jinhsi-zhezhi",
    "characterIds": [
      "the-shorekeeper",
      "zhezhi",
      "jinhsi"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": false,
    "relatedReferenceIds": [
      "prydwen-zhezhi-standard",
      "prydwen-jinhsi-standard"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/glacio/zhezhi.ts",
      "src/resonators/spectro/jinhsi.ts"
    ],
    "infoSv": [
      "Ny explicit dubbel-Intro-modell: Shorekeeper → Jinhsi → Zhezhi → Jinhsi. Den ersätter inte Arab WuWas besökstider, som inte publicerades individuellt."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Zhezhi",
        "mode": null,
        "sequence": 0,
        "weapon": "Rime-Draped Sprouts R1",
        "echo": "Nightmare: Lampylumen Myriad",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "zhezhi"
      },
      {
        "actor": "Jinhsi",
        "mode": null,
        "sequence": 0,
        "weapon": "Ages of Harvest R1",
        "echo": "Jué",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "jinhsi"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1769,
        "visits": [
          {
            "characterId": "jinhsi",
            "startFrame": 0,
            "endFrame": 12,
            "durationFrames": 12,
            "workFrames": 12,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 12,
            "endFrame": 389,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "jinhsi",
            "startFrame": 389,
            "endFrame": 809,
            "durationFrames": 420,
            "workFrames": 420,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "zhezhi",
            "startFrame": 809,
            "endFrame": 1276,
            "durationFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1276,
            "endFrame": 1688,
            "durationFrames": 412,
            "workFrames": 412,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1688,
            "endFrame": 1769,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "zhezhi",
            "fieldFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "jinhsi",
            "fieldFrames": 844,
            "workFrames": 844,
            "waitFrames": 0,
            "visitCount": 3
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1607,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "jinhsi",
            "startFrame": 215,
            "endFrame": 647,
            "durationFrames": 432,
            "workFrames": 420,
            "waitFrames": 12,
            "waits": [
              {
                "atFrame": 275,
                "durationFrames": 12
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "zhezhi",
            "startFrame": 647,
            "endFrame": 1114,
            "durationFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1114,
            "endFrame": 1526,
            "durationFrames": 412,
            "workFrames": 412,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1526,
            "endFrame": 1607,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "zhezhi",
            "fieldFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "jinhsi",
            "fieldFrames": 844,
            "workFrames": 832,
            "waitFrames": 12,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1607,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 227,
            "durationFrames": 227,
            "workFrames": 215,
            "waitFrames": 12,
            "waits": [
              {
                "atFrame": 203,
                "durationFrames": 12
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 227,
            "endFrame": 647,
            "durationFrames": 420,
            "workFrames": 420,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "zhezhi",
            "startFrame": 647,
            "endFrame": 1114,
            "durationFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1114,
            "endFrame": 1526,
            "durationFrames": 412,
            "workFrames": 412,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1526,
            "endFrame": 1607,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 308,
            "workFrames": 296,
            "waitFrames": 12,
            "visitCount": 2
          },
          {
            "characterId": "zhezhi",
            "fieldFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "jinhsi",
            "fieldFrames": 832,
            "workFrames": 832,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1607,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 227,
            "durationFrames": 227,
            "workFrames": 215,
            "waitFrames": 12,
            "waits": [
              {
                "atFrame": 203,
                "durationFrames": 12
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 10
          },
          {
            "characterId": "jinhsi",
            "startFrame": 227,
            "endFrame": 647,
            "durationFrames": 420,
            "workFrames": 420,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "zhezhi",
            "startFrame": 647,
            "endFrame": 1114,
            "durationFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "jinhsi",
            "startFrame": 1114,
            "endFrame": 1526,
            "durationFrames": 412,
            "workFrames": 412,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1526,
            "endFrame": 1607,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 308,
            "workFrames": 296,
            "waitFrames": 12,
            "visitCount": 2
          },
          {
            "characterId": "zhezhi",
            "fieldFrames": 467,
            "workFrames": 467,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "jinhsi",
            "fieldFrames": 832,
            "workFrames": 832,
            "waitFrames": 0,
            "visitCount": 2
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 26.783333333333335,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 5.066666666666666,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0.13333333333333333
      },
      {
        "characterId": "zhezhi",
        "fieldSeconds": 7.783333333333333,
        "workSeconds": 7.783333333333333,
        "waitSeconds": 0
      },
      {
        "characterId": "jinhsi",
        "fieldSeconds": 13.933333333333334,
        "workSeconds": 13.866666666666667,
        "waitSeconds": 0.06666666666666667
      }
    ]
  },
  {
    "id": "standard-model-zani-phoebe-confession",
    "coordinationCaseId": "zani-phoebe-confession",
    "characterIds": [
      "the-shorekeeper",
      "phoebe",
      "zani"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "contiguous-phoebe-confession",
    "contextChangeRequired": true,
    "relatedReferenceIds": [
      "prydwen-phoebe-confession",
      "prydwen-zani-standard"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "PUBLISHED_TEAM_MODEL_ADAPTED_TO_COMPLETE_ACTIONS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/spectro/phoebe.ts",
      "src/resonators/spectro/zani.ts"
    ],
    "infoSv": [
      "Alternativ sammanhängande Phoebe Confession-fas mellan Shorekeeper och Zani, utan Phoebes två besök i den tidigare tabellen."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Phoebe",
        "mode": null,
        "sequence": 0,
        "weapon": "Luminous Hymn R1",
        "echo": "Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "phoebe"
      },
      {
        "actor": "Zani",
        "mode": null,
        "sequence": 0,
        "weapon": "Blazing Justice R1",
        "echo": "Capitaneus",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "zani"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1723,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 377,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "phoebe",
            "startFrame": 377,
            "endFrame": 809,
            "durationFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "zani",
            "startFrame": 809,
            "endFrame": 1642,
            "durationFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1642,
            "endFrame": 1723,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "phoebe",
            "fieldFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "zani",
            "fieldFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1561,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phoebe",
            "startFrame": 215,
            "endFrame": 647,
            "durationFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "zani",
            "startFrame": 647,
            "endFrame": 1480,
            "durationFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1480,
            "endFrame": 1561,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "phoebe",
            "fieldFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "zani",
            "fieldFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1561,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phoebe",
            "startFrame": 215,
            "endFrame": 647,
            "durationFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "zani",
            "startFrame": 647,
            "endFrame": 1480,
            "durationFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1480,
            "endFrame": 1561,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "phoebe",
            "fieldFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "zani",
            "fieldFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1561,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "phoebe",
            "startFrame": 215,
            "endFrame": 647,
            "durationFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "zani",
            "startFrame": 647,
            "endFrame": 1480,
            "durationFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1480,
            "endFrame": 1561,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "phoebe",
            "fieldFrames": 432,
            "workFrames": 432,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "zani",
            "fieldFrames": 833,
            "workFrames": 833,
            "waitFrames": 0,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 26.016666666666666,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "phoebe",
        "fieldSeconds": 7.2,
        "workSeconds": 7.2,
        "waitSeconds": 0
      },
      {
        "characterId": "zani",
        "fieldSeconds": 13.883333333333333,
        "workSeconds": 13.883333333333333,
        "waitSeconds": 0
      }
    ]
  },
  {
    "id": "standard-model-rover-havoc-danjin-hypercarry",
    "coordinationCaseId": "rover-havoc-danjin-hypercarry",
    "characterIds": [
      "the-shorekeeper",
      "danjin",
      "rover-havoc"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "full-animation-reference",
    "contextChangeRequired": true,
    "relatedReferenceIds": [
      "prydwen-danjin-hybrid",
      "prydwen-rover-havoc-medium-burst"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "BELLIBING_COMPOSITION_OF_PUBLISHED_MEMBER_MODELS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/havoc/danjin.ts",
      "src/resonators/havoc/rover_havoc.ts"
    ],
    "infoSv": [
      "Bellibing-komposition av publicerade source-loadouts. Rover S2 undviker källans S4 stat-hook-fel; Danjin S6 använder 60-Ruby-varianten. Sista Wingblade utelämnas för att undvika dess långa cooldown-väntan; två Umbra-kedjor behålls. Skillnad mot den tidigare medium-guiden redovisas."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Danjin",
        "mode": null,
        "sequence": 6,
        "weapon": "Emerald Sentence R1",
        "echo": "Nightmare: Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "danjin"
      },
      {
        "actor": "Havoc Rover",
        "mode": null,
        "sequence": 2,
        "weapon": "Red Spring R1",
        "echo": "Nightmare: Crownless",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "rover-havoc"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1674,
        "visits": [
          {
            "characterId": "rover-havoc",
            "startFrame": 0,
            "endFrame": 12,
            "durationFrames": 12,
            "workFrames": 12,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 12,
            "endFrame": 389,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "danjin",
            "startFrame": 389,
            "endFrame": 916,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 916,
            "endFrame": 1593,
            "durationFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "waits": [
              {
                "atFrame": 1380,
                "durationFrames": 201
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 23
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1593,
            "endFrame": 1674,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 689,
            "workFrames": 488,
            "waitFrames": 201,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "waits": [
              {
                "atFrame": 1206,
                "durationFrames": 201
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 23
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "waits": [
              {
                "atFrame": 1206,
                "durationFrames": 201
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 23
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "waits": [
              {
                "atFrame": 1206,
                "durationFrames": 201
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 23
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 476,
            "waitFrames": 201,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 25,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "danjin",
        "fieldSeconds": 8.783333333333333,
        "workSeconds": 8.783333333333333,
        "waitSeconds": 0
      },
      {
        "characterId": "rover-havoc",
        "fieldSeconds": 11.283333333333333,
        "workSeconds": 7.933333333333334,
        "waitSeconds": 3.35
      }
    ]
  },
  {
    "id": "standard-model-rover-havoc-danjin-shared-dps",
    "coordinationCaseId": "rover-havoc-danjin-shared-dps",
    "characterIds": [
      "the-shorekeeper",
      "danjin",
      "rover-havoc"
    ],
    "reviewStatus": "REVIEWED_DECLARED_MODEL_SCENARIO",
    "contextVariant": "simple-sequential-one-umbra",
    "contextChangeRequired": true,
    "relatedReferenceIds": [
      "prydwen-danjin-damage-dealer",
      "prydwen-rover-havoc-short-burst"
    ],
    "referenceRelationship": "RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING",
    "recipeBasis": "BELLIBING_COMPOSITION_OF_PUBLISHED_MEMBER_MODELS",
    "sourcePaths": [
      "src/teams.ts",
      "src/engine/rotation.ts",
      "src/engine/state.ts",
      "src/teamrun.ts",
      "src/resonators/spectro/shorekeeper.ts",
      "src/resonators/havoc/danjin.ts",
      "src/resonators/havoc/rover_havoc.ts"
    ],
    "infoSv": [
      "Bellibing-komposition med en Umbra-kedja i Rover-fasen och samma fulla Danjin-del. Sista Wingblade utelämnas. Färre attacker frigör mer väntetid före Shorekeeper, inte en snabbare 25-sekunderscykel. Detta är en enkel sekventiell två-skadebidrag-variant, inte guidens avancerade short-quickswap."
    ],
    "timingUse": "CONSEQUENCE_SCENARIO_ONLY_NOT_LIVE_MECHANIC_VERIFICATION",
    "sourceCommit": "195a22f1b7a1b55b953224e26742b896a719e1c3",
    "sourceUrl": "https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3",
    "clock": "PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP",
    "builds": [
      {
        "actor": "Shorekeeper",
        "mode": null,
        "sequence": 0,
        "weapon": "Stellar Symphony R1",
        "echo": "Fallacy of No Return",
        "mainstat": "43311 HP ER ER hp hp",
        "highSubs": false,
        "characterId": "the-shorekeeper"
      },
      {
        "actor": "Danjin",
        "mode": null,
        "sequence": 6,
        "weapon": "Emerald Sentence R1",
        "echo": "Nightmare: Impermanence Heron",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "danjin"
      },
      {
        "actor": "Havoc Rover",
        "mode": null,
        "sequence": 2,
        "weapon": "Red Spring R1",
        "echo": "Nightmare: Crownless",
        "mainstat": "43311 CR ATK ATK atk atk",
        "highSubs": false,
        "characterId": "rover-havoc"
      }
    ],
    "phases": [
      {
        "rotationNumber": 1,
        "cycleFrames": 1674,
        "visits": [
          {
            "characterId": "rover-havoc",
            "startFrame": 0,
            "endFrame": 12,
            "durationFrames": 12,
            "workFrames": 12,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 2
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 12,
            "endFrame": 389,
            "durationFrames": 377,
            "workFrames": 377,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 15
          },
          {
            "characterId": "danjin",
            "startFrame": 389,
            "endFrame": 916,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 916,
            "endFrame": 1593,
            "durationFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "waits": [
              {
                "atFrame": 1317,
                "durationFrames": 264
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1593,
            "endFrame": 1674,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 458,
            "workFrames": 458,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 689,
            "workFrames": 425,
            "waitFrames": 264,
            "visitCount": 2
          }
        ]
      },
      {
        "rotationNumber": 2,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "waits": [
              {
                "atFrame": 1143,
                "durationFrames": 264
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 3,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "waits": [
              {
                "atFrame": 1143,
                "durationFrames": 264
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "visitCount": 1
          }
        ]
      },
      {
        "rotationNumber": 4,
        "cycleFrames": 1500,
        "visits": [
          {
            "characterId": "the-shorekeeper",
            "startFrame": 0,
            "endFrame": 215,
            "durationFrames": 215,
            "workFrames": 215,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 9
          },
          {
            "characterId": "danjin",
            "startFrame": 215,
            "endFrame": 742,
            "durationFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "waits": [],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 13
          },
          {
            "characterId": "rover-havoc",
            "startFrame": 742,
            "endFrame": 1419,
            "durationFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "waits": [
              {
                "atFrame": 1143,
                "durationFrames": 264
              }
            ],
            "kind": "ACTOR_VISIT",
            "sourceActionCount": 17
          },
          {
            "characterId": "the-shorekeeper",
            "startFrame": 1419,
            "endFrame": 1500,
            "durationFrames": 81,
            "workFrames": 81,
            "waitFrames": 0,
            "waits": [],
            "kind": "CYCLE_CLOSING_INTRO",
            "sourceActionCount": 1
          }
        ],
        "members": [
          {
            "characterId": "the-shorekeeper",
            "fieldFrames": 296,
            "workFrames": 296,
            "waitFrames": 0,
            "visitCount": 2
          },
          {
            "characterId": "danjin",
            "fieldFrames": 527,
            "workFrames": 527,
            "waitFrames": 0,
            "visitCount": 1
          },
          {
            "characterId": "rover-havoc",
            "fieldFrames": 677,
            "workFrames": 413,
            "waitFrames": 264,
            "visitCount": 1
          }
        ]
      }
    ],
    "meanLaterCycleSeconds": 25,
    "meanMemberSeconds": [
      {
        "characterId": "the-shorekeeper",
        "fieldSeconds": 4.933333333333334,
        "workSeconds": 4.933333333333334,
        "waitSeconds": 0
      },
      {
        "characterId": "danjin",
        "fieldSeconds": 8.783333333333333,
        "workSeconds": 8.783333333333333,
        "waitSeconds": 0
      },
      {
        "characterId": "rover-havoc",
        "fieldSeconds": 11.283333333333333,
        "workSeconds": 6.883333333333334,
        "waitSeconds": 4.4
      }
    ]
  }
] as const;
export const TEAM_TIMING_RESEARCH_COVERAGE = [
  {
    "coordinationCaseId": "augusta-iuno-shorekeeper",
    "publishedSourceIds": [
      "arabwuwa-augusta-iuno-shorekeeper-35"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "hsin-jinhsi-shorekeeper-unison",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-hsin-jinhsi-shorekeeper-unison"
    ]
  },
  {
    "coordinationCaseId": "hsin-rover-electro-buling-flare",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-hsin-rover-electro-buling-flare"
    ]
  },
  {
    "coordinationCaseId": "hsin-rover-electro-suisui-flare",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-hsin-rover-electro-suisui-flare"
    ]
  },
  {
    "coordinationCaseId": "aemeath-lynae-mornye",
    "publishedSourceIds": [
      "arabwuwa-aemeath-lynae-mornye-86"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "aemeath-changli-quickswap",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-aemeath-changli-quickswap"
    ]
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-rover-aero",
    "publishedSourceIds": [
      "arabwuwa-cartethyia-ciaccona-rover-aero-40"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "cartethyia-chisa-rover-aero",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-cartethyia-chisa-rover-aero"
    ]
  },
  {
    "coordinationCaseId": "cartethyia-low-erosion",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-cartethyia-low-erosion"
    ]
  },
  {
    "coordinationCaseId": "brant-lupa-mornye-dps",
    "publishedSourceIds": [
      "arabwuwa-brant-lupa-mornye-84"
    ],
    "modelScenarioIds": [
      "standard-model-brant-lupa-mornye-dps"
    ]
  },
  {
    "coordinationCaseId": "changli-brant-lupa",
    "publishedSourceIds": [
      "arabwuwa-changli-brant-lupa-24"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "zani-phoebe-confession",
    "publishedSourceIds": [
      "arabwuwa-zani-phoebe-shorekeeper-33"
    ],
    "modelScenarioIds": [
      "standard-model-zani-phoebe-confession"
    ]
  },
  {
    "coordinationCaseId": "phrolova-lucilla-qiuyuan",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-phrolova-lucilla-qiuyuan"
    ]
  },
  {
    "coordinationCaseId": "phrolova-cantarella",
    "publishedSourceIds": [
      "arabwuwa-cantarella-qiuyuan-phrolova-43"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "jinhsi-zhezhi",
    "publishedSourceIds": [
      "arabwuwa-jinhsi-zhezhi-shorekeeper-58"
    ],
    "modelScenarioIds": [
      "standard-model-jinhsi-zhezhi"
    ]
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-chisa",
    "publishedSourceIds": [
      "arabwuwa-cartethyia-ciaccona-chisa-50"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "cartethyia-ciaccona-the-shorekeeper",
    "publishedSourceIds": [
      "arabwuwa-cartethyia-ciaccona-shorekeeper-38"
    ],
    "modelScenarioIds": []
  },
  {
    "coordinationCaseId": "rover-havoc-danjin-hypercarry",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-rover-havoc-danjin-hypercarry"
    ]
  },
  {
    "coordinationCaseId": "rover-havoc-danjin-shared-dps",
    "publishedSourceIds": [],
    "modelScenarioIds": [
      "standard-model-rover-havoc-danjin-shared-dps"
    ]
  }
] as const;
