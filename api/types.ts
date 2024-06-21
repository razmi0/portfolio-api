export type ContactFormType = {
  tel: string;
  email: string;
  msg: string;
  hp?: string;
};

export type MessagesTableArgs = [string, string, string, string];

export type ErrorTableArgs = [string, string, string];
export type ErrorTableFieldType = "contact";
export type AgentTableArgs = [string, string, string, string, string, string, number];

export type UserAgentInfo = {
  userAgent: string;
  platform: string;
  hardware: string;
  locale: string;
  connection: string;
};

export type MinimalResponse = {
  authorized: boolean;
  success: boolean;
};
