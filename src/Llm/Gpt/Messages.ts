export class BaseMessage {
  role: "user" | "assistant" | "system";
  name?: string;
  content: string;

  constructor(
    role: "user" | "assistant" | "system",
    content: string,
    name?: string
  ) {
    this.role = role;
    this.content = content;
    this.name = name;
  }
}

export class HumanMessage extends BaseMessage {
  constructor(content: string, name?: string) {
    super("user", content, name);
  }
}

export class AIMessage extends BaseMessage {
  constructor(content: string, name?: string) {
    super("assistant", content, name);
  }
}

export class SystemMessage extends BaseMessage {
  constructor(content: string, name?: string) {
    super("system", content, name);
  }
}
