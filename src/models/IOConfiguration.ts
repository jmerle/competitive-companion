export interface InputConfiguration {
  type: 'stdin' | 'file' | 'regex';
  fileName?: string;
  pattern?: string;
}

export interface OutputConfiguration {
  type: 'stdout' | 'file';
  fileName?: string;
}
