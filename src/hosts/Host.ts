export interface Host {
  send(data: string): Promise<void>;
}
