/**
 * Runs the function `fn`
 * and retries automatically if it fails.
 *
 * Tries max `1 + retries` times
 * with `retryIntervalMs` milliseconds between retries.
 *
 * From https://mtsknn.fi/blog/js-retry-on-fail/
 */
const sleep = (ms = 0) => new Promise((resolve: any) => setTimeout(resolve, ms))

type Options = {
  retries: number;
  retryIntervalMs: number;
  customSleep: (arg0: number) => Promise<void> | undefined;
}

export const retry = async <T>(
  fn: () => Promise<T> | T,
  options: Options
): Promise<T> => {
  const { retries, retryIntervalMs, customSleep } = options

  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    if(Boolean(customSleep)) {
      await customSleep(retryIntervalMs)
    } else {
      await sleep(retryIntervalMs)
    }
    return retry(fn, { ...options, retries: retries - 1 })
  }
}
