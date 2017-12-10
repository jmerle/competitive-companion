export default interface Sendable {
  send(): Promise<void>;
}
