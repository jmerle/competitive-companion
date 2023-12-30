export interface Message {
  action: MessageAction;
  payload?: any;
}

export enum MessageAction {
  Parse,
  SendTask,
  SendTaskDone,
  SendTaskFailed,
  Fetch,
  FetchResult,
  FetchFailed,
}
