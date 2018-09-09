class Config {
  private readonly defaultValues: any = {
    customPorts: [],
    debugMode: false,
  };

  public get<T extends browser.storage.StorageValue>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      browser.storage.local
        .get(key)
        .then(data => resolve((data[key] || this.defaultValues[key]) as any))
        .catch(reject);
    });
  }

  public set(key: string, value: browser.storage.StorageValue): Promise<void> {
    return browser.storage.local.set({ [key]: value });
  }
}

export const config = new Config();
