# Echo Simulator — public UI and source boundary

This document describes the **publicly supported UI/sandbox contract** and its availability limits. The implemented [Echo Simulator foundation](ECHO_SIMULATOR_FOUNDATION.md) is a memory-only public sandbox; it does not contain a deployed Character evaluator or an end-to-end Improvement Cost simulator.

## UI and owned state

Echo Simulator lives within **Improve a Character**, with **Current** and **Simulate** views. Current remains the user's real saved build. Simulate owns a separate, temporary session for the same Character and begins with five empty Echo slots. A simulated card, candidate or accepted Echo **must never mutate real equipment** or be written to `CharacterBuildState`.

The five slot cards show accepted simulated Echoes. **New Echo** represents the active candidate; each slot has its own **Trash Pile** for rejected candidates. Cards and their observed checkpoint histories can be inspected without changing their original ownership. A user can select any slot; simulation need not follow a fixed slot order. Session history is independent of the real account inventory.

Public presentation may distinguish **Interactive** and **Auto** modes as views of the same verified simulation state. Neither mode may invent an evaluation, reject/accept verdict or readiness signal.

## Verified mechanics and resource presentation

The resource display uses **Tuners, Tubes and candidate Echoes** as separate concepts. Canonical Echo substat tiers/probabilities, checkpoint costs and inventory facts come from the public [Echo Core rules](../src/echoCoreRules.ts), [resource inventory](../src/resourceInventory.ts) and [exact Tube spending contract](ECHO_EXACT_TUBE_SPENDING.md). Do not duplicate game mechanics or derive missing source facts from UI expectations.

Simulator resources and user-owned Improve Settings retain their existing authority and persistence contracts. Candidate generation, roll outcomes, consumption and recovery cannot be treated as complete until their own source/mechanic gates pass.

## Pending capability boundary

Character-aware Build Need, useful improvement detection, economic continue/reject/accept decisions, complete resource recovery, full five-slot automatic orchestration and repeated-run Improvement Cost **remain Pending** unless independently verified by their owning executable path. No public frontend may fabricate an evaluator result from a target stat, static Echo label or heuristic score. Missing or disputed mechanics remain **Pending/Unknown**.

The existing public sandbox and canonical mechanics are not evidence of a deployable evaluator, team DPS result or finished optimization policy.

See [Improve Settings](UI_IMPROVE_SIMPLE_SETTINGS.md), [Echo Engine Boundaries](ECHO_ENGINE_BOUNDARIES.md), [current product status](PROJECT_STATUS.md), [public decision boundary](DECISION_MODEL.md) and [product contract](PRODUCT_CONTRACT.md).
