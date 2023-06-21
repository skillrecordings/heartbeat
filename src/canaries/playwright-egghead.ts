import {runHealthChecks, Step} from '../runner'

const baseUrl = 'https://egghead.io'

export const testEgghead = async ({ event, step }: {event: any; step: Step}) => {
  await step.run('Test Price Display', async ({ chromium }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseUrl);

    const body = { priceIsVisible: false }

    await page
      .getByRole('link')
      .filter({ hasText: 'Pricing' })
      .click();

    // Sometimes the pricing takes a moment to load
    await page.waitForTimeout(500)

    const options = { retries: 3, retryIntervalMs: 500 }
    await page.retry(async () => {
      const priceIsVisible =
        await page.locator('div')
          .filter({ hasText: /^USD\$250$/ })
          .first()
          .isVisible()

      if(priceIsVisible) {
        body.priceIsVisible = true
      } else {
        throw new Error("Unable to find tag with specific price on Pricing page")
      }
    }, options)

    return { event, body };
  })

  await step.run('Test View First Video', async ({ chromium }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const body = {
      courseHeadingIsVisible: false,
      lessonHeadingIsVisible: false,
      videoTagIsVisible: false
    }

    await page.goto(baseUrl);

    // Open Browse overlay
    await page
      .getByRole('button')
      .filter({ hasText: 'Browse' })
      .click();

    // Click React menu item
    await page
      .getByRole('link')
      .filter({ hasText: /^React$/ })
      .click();

    await page.waitForTimeout(500)

    // Click The Beginner's Guide to React course
    const options = { retries: 3, retryIntervalMs: 500 }
    await page.retry(async () => {
      await page
        .getByRole('link', { name: "The Beginner's Guide to React" })
        .first()
        .click();
    }, options)

    await page.waitForTimeout(500)

    body.courseHeadingIsVisible = await page
      .getByRole("heading", { name: "The Beginner's Guide to React" })
      .first()
      .isVisible()

    // Start Learning
    await page
      .getByRole('link')
      .filter({ hasText: 'Start Watching' })
      .click()

    await page.waitForTimeout(500)

    body.lessonHeadingIsVisible = await page
      .getByRole("heading")
      .filter({ hasText: "A Beginners Guide to React Introduction" })
      .isVisible()

    await page.retry(async () => {
      const videoVisible = await page.locator('video').isVisible()

      if(videoVisible) {
        body.videoTagIsVisible = true
      } else {
        throw new Error("Video tag not visible on first exercise of Beginner's Guide to React");
      }
    }, options)

    return { event, body }
  })
}

runHealthChecks(testEgghead)
