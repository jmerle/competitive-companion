export interface Message {
  action: MessageAction;
  payload?: any;
}

export enum MessageAction {
  Parse,
  SendTask,
  TaskSent,
  SendGCCFile,
  GCCFileResult,
  GCCRequestFailed,
}
