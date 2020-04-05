export interface Message {
  action: MessageAction;
  payload?: any;
}

export enum MessageAction {
  SendTask,
  TaskSent,
}
