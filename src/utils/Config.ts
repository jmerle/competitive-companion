export class Config {
  public static defaultValues: any = {
    customPorts: [],
    debugMode: false,
  };

  public static get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      browser.storage.local
        .get(key)
        .then(data => resolve((data[key] || Config.defaultValues[key]) as any))
        .catch(reject);
    });
  }

  public static set(
    key: string,
    value: browser.storage.StorageValue,
  ): Promise<void> {
    return browser.storage.local.set({ [key]: value });
  }
}
