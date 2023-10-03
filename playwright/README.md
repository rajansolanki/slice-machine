# End-to-End Playwright tests

This is an ongonig proof of concept to run the end-to-end tests using the Playwright framework.


## Installation

```bash
  npm install
```
    
## How to run tests

Run all tests

```bash
  npx playwright test
```

Run tests in a single browser (should be configured in [playwright.config.ts](./playwright.config.ts))
```bash
  npx playwright test --project "chromium"
```

Run a single test
```bash
  npx playwright test tests/slice.spec.ts
```

Run a single test in headed mode (slower, but opens the browser for visual feedback)
```bash
  npx playwright test slice.spec.ts --headed
```

Record traces of tests execution
```
npx playwright test --trace on
```

Open the test report
```bash
npx playwright show-report
```

See other examples on the [official documentation](https://playwright.dev/docs/running-tests)


## FAQ


## Useful links

- [VS Code extension](https://playwright.dev/docs/getting-started-vscode)
- [Official documentation](https://playwright.dev)
