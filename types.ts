
export enum Language {
  AR = 'ar',
  EN = 'en'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export enum AppMode {
  GENERAL = 'general',
  LEARNING = 'learning',
  BRAINSTORM = 'brainstorm'
}
