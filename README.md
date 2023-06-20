# heartbeat

The main workflow to pay attention to is the one that runs
canaries/healthchecks using Playwright (`.github/workflows/playwright.yml`).

This workflow is
[scheduled](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
to run every hour on the hour.

This workflow can be dispatched manually from the GitHub Actions UI or via a
script located in the bin directory:

```bash
$ ./bin/send-workflow-dispatch.sh
```

In order to run that shell script dispatch, you need to have a personal GitHub
access token created and set in the `.env.local` file. To do that, start by
copying the example environment file.

```bash
$ cp .env.local{.example,}
```

The `playwright.yml` workflow will kick off several other workflows that run
playwright canaries/healthchecks against several web properites. The specific
playwright logic for each of those canaries lives in `src/canaries`.

Each of those Playwright canaries can be individually, locally invoked like so:

```bash
$ npm run healthcheck -- src/canaries/playwright-total-typescript.ts
```
