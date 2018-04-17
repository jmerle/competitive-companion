export interface Message {
  action: MessageAction;
  payload?: any;
}

export enum MessageAction {
  CheckTab,
  Parse,
  EnablePageAction,
  DisablePageAction,
  SendTask,
  TaskSent,
}
