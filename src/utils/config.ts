class Config {
  private readonly defaultValues: any = {
    customPorts: [],
    debugMode: false,
  };

  public async get<T extends browser.storage.StorageValue>(key: string): Promise<T> {
    const data = await browser.storage.local.get(key);
    return data[key] || this.defaultValues[key];
  }

  public set(key: string, value: browser.storage.StorageValue): Promise<void> {
    return browser.storage.local.set({ [key]: value });
  }
}

export const config = new Config();
