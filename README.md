# Bellibing Simulator

Public Wuthering Waves character-building and Echo tools, with source-reviewed game data and mechanics.

## Use

- [Character Build / Improve](https://bellebing.github.io/Bellibing-simulator/ui-preview/)
- [Echo Lab](https://bellebing.github.io/Bellibing-simulator/echo-lab.html)

The interface supports character/build presentation, Echo mechanics and user-owned inputs. Automated improvement evaluation and recommendation decisions are not available in the public app; unavailable evaluations remain **Pending**.

## Develop locally

Requires Node.js 22 or later.

```sh
npm install
npm test
npm run build
```

`npm run build` creates the allowlisted browser application in `dist/` and checks generated-data parity. It does not deploy.

## Sources and scope

Game facts, stat formulas, effects and gameplay assumptions are documented with provenance in the relevant source/data files. Source gaps and disputed mechanics remain **Pending/Unknown**, not zero.

See [public product scope](docs/PRODUCT_CONTRACT.md), [current feature status](docs/PROJECT_STATUS.md), [data verification policy](docs/DATA_VERIFICATION_POLICY.md) and [deployment contract](docs/PAGES_DEPLOYMENT.md).
