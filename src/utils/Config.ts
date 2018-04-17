export class Config {
  static get<T>(key: string, defaultValue?: T): Promise<T> {
    return new Promise((resolve, reject) => {
      browser.storage.local
        .get(key)
        .then(data => resolve((data[key] || defaultValue) as any))
        .catch(reject);
    });
  }

  static set(key: string, value: browser.storage.StorageValue): Promise<void> {
    return browser.storage.local.set({ [key]: value });
  }

  static getAll(): Promise<any> {
    return browser.storage.local.get();
  }

  static remove(key: string): Promise<void> {
    return browser.storage.local.remove(key);
  }

  static clear(): Promise<void> {
    return browser.storage.local.clear();
  }
}
