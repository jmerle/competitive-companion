export interface LanguageConfiguration {
  java: JavaConfiguration;
}

export interface JavaConfiguration {
  mainClass: string;
  taskClass: string;
}
