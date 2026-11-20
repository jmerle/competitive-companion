import { browser } from './browser';

interface ConfigItems {
  customPorts: number[];
  customRules: [string, string][];
  requestTimeout: number;
  debugMode: boolean;
}

class Config {
  private readonly defaults: Partial<ConfigItems> = {
    customPorts: [],
    customRules: [],
    requestTimeout: 500,
    debugMode: false,
  };

  public async get<T extends keyof ConfigItems>(key: T): Promise<ConfigItems[T]> {
    const data = await browser.storage.local.get(key);
    return (data[key] || this.defaults[key]) as ConfigItems[T];
  }

  public set<T extends keyof ConfigItems>(key: T, value: ConfigItems[T]): Promise<void> {
    return browser.storage.local.set({ [key]: value });
  }
}

export const config = new Config();

/**
 * Reads the configured request timeout. The fallback is used when storage is
 * unavailable (for example when parsers are run outside of an extension
 * context, such as in the test harness).
 */
export async function getRequestTimeout(fallback: number): Promise<number> {
  try {
    const value = await config.get('requestTimeout');
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  } catch (err) {
    // Storage is not available in this context.
  }

  return fallback;
}
