export type ContactFormType = {
  tel: string;
  email: string;
  msg: string;
  hp?: string;
};

export type LoginFormType = {
  username: string;
  password: string;
  hp?: string;
};

export type ErrorsContactFormType = {
  email: boolean | string;
  tel: boolean | string;
  msg: boolean | string;
  reachable: boolean | string;
};

export type MessagesTableArgs = [string, string, string, string];

export type ErrorTableArgs = [string, string, string];
export type ErrorTableFieldType = "contact" | "login";
export type AgentTableArgs = [string, string, string, string, string, string, number];

export type UserTableArgs = [string, string];

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

export type ErrorLoginFormType = {
  username: string | false;
  password: string | false;
  hp?: string | false;
};
