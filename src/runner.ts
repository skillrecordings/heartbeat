import { chromium as playwrightChromium } from 'playwright-core';

const chromium = (() => {
  const launch = async () => {
    return playwrightChromium.launch({headless: true})
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
