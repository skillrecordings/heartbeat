import {runHealthChecks, Step} from '../runner'

const baseUrl = 'https://totaltypescript.com'

function isValidMonetaryValue(value: string) {
  const re = /^\$?\d+(\.\d{2})?$/;
  return re.test(value);
}

export const testTotalTypeScript = async ({ event, step }: {event: any; step: Step}) => {
  await step.run('Test Price Display', async ({ chromium }) => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseUrl);

    // Sometimes the pricing takes a moment to load
    await page.waitForTimeout(500)

    // Find the div with the 'data-price' attribute within the main div
    const pricingDiv = await page.$('div#main-pricing div[data-price]');
    const text = (pricingDiv && await pricingDiv.textContent()) || '';
    const validPricing = isValidMonetaryValue(text)

    // Check if the price is displaying as a valid number
    if (validPricing) {
      return { event, body: { displayPrice: text } };
    } else {
      throw new Error("Div with 'data-price' attribute not found within the '#main-pricing' div.");
    }
  })

  await step.run('Test View First Video', async ({ chromium }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const body = {lessonHeadingVisible: false, videoTagVisible: false}

    await page.goto(baseUrl);

    // Go to Pro Workshops
    await page.getByText('Pro Workshops').first().click()

    // Go to Type Transformations module
    await page
    .getByRole('link')
    .filter({ hasText: 'Type Transformations' })
    .click();

    // Start Learning
    await page
    .getByRole('link')
    .filter({ hasText: 'Start Learning' })
    .click()

    await page.waitForTimeout(500)

    const options = { retries: 3, retryIntervalMs: 500 }
    await page.retry(async () => {
      const headingVisible =
        await page
        .getByRole('heading', { name: "Type Transformations Workshop Welcome" })
        .isVisible()

      if(headingVisible) {
        body.lessonHeadingVisible = true
      } else {
        throw new Error(`Heading not visible on first exercise of Type Transformations after ${options.retries} retries`);
      }
    }, options)

    await page.waitForTimeout(500)

    const videoVisible = await page.locator('video').isVisible()

    if(videoVisible) {
      body.videoTagVisible = true
    } else {
      throw new Error("Video tag not visible on first exercise of Type Transformations");
    }

    return { event, body }
  })
}

runHealthChecks(testTotalTypeScript)
