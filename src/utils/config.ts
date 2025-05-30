import { browser } from './browser';

interface ConfigItems {
  customHosts: string[];
  customPorts: number[];
  customRules: [string, string][];
  requestTimeout: number;
  debugMode: boolean;
}

class Config {
  private readonly defaults: Partial<ConfigItems> = {
    customHosts: [],
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
