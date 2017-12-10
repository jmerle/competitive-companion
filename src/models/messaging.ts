export interface Message {
  action: MessageAction;
  payload?: any;
}

export enum MessageAction {
  CheckTab,
  Parse,
  EnableParsing,
  DisableParsing,
  SendTask,
  TaskSent,
}
