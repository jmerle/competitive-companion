export interface Sendable {
  send(): Promise<void>;
}
