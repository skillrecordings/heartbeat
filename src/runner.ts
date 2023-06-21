import { chromium as playwrightChromium } from 'playwright-core';
import { retry, Options } from './retry'

type WrappedRetry = typeof retry

const chromium = (() => {
  const launch = async () => {
    const originalBrowser = await playwrightChromium.launch({headless: true})

    const browser = { ...originalBrowser, newContext: async () => {
      const originalContext = await originalBrowser.newContext();

      const context = { ...originalContext, newPage: async () => {
        type PageWithRetry = Awaited<ReturnType<typeof originalContext.newPage>> & {retry: typeof retry}
        const originalPage = await originalContext.newPage() as PageWithRetry

        const playwrightSleep = async (retryIntervalMs: number) => { await originalPage.waitForTimeout(retryIntervalMs) }

        const wrappedRetry: WrappedRetry = async (fn, { retries, retryIntervalMs, customSleep}) => {
          const options = {
            retries,
            retryIntervalMs,
            customSleep: customSleep || playwrightSleep
          }
          return retry(fn, options);
        }

        originalPage.retry = wrappedRetry

        return originalPage
      }}

      return context
    }}

    return browser;
  }

  return { launch }
})()

type Chromium = typeof chromium
type TestFunction = ({ chromium }: { chromium: Chromium }) => Promise<any>
type CheckFunction = ({event, step}: { event: any; step: any}) => Promise<void>

type RunFunction = (testDescription: string, testFunction: TestFunction) => Promise<void>
export type Step = {
  run: RunFunction;
  xrun: RunFunction;
}

export const runHealthChecks = async (checksFn: CheckFunction) => {
  const event = { time: new Date() }
  const run = async (testDescription: string, testFunction: TestFunction) => {
    console.log(testDescription);
    const result = await testFunction({ chromium })
    console.log(result)
  }
  const xrun = async (testDescription: string, _testFunction: TestFunction) => {
    console.log(`Skipping "${testDescription}"`)
  }
  const step: Step = {
    run,
    xrun
  }

  await checksFn({ event, step })

  process.exit(0);
}
