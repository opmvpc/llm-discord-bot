import { ChatOllama } from "langchain/chat_models/ollama";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { Message, Collection, Snowflake } from "discord.js";
import { StringOutputParser } from "langchain/schema/output_parser";
import prompts from "./prompts";

class Llm {
  llm: ChatOllama;

  constructor() {
    console.log("Llm");
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "openhermes2-mistral",
    });
  }

  async ask(
    messages: Collection<Snowflake, Message>,
    botName: string
  ): Promise<string> {
    const history = await this.formatHistory(messages, botName);

    const stream = await this.llm
      .pipe(new StringOutputParser())
      .stream([new SystemMessage(prompts.system.fr), ...history]);

    const chunks = [];
    try {
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
    } catch (error: any) {
      console.error(error);
      throw error;
    }

    return chunks.join("");
  }

  async formatHistory(
    messages: Collection<Snowflake, Message>,
    botName: string
  ): Promise<BaseMessage[]> {
    return messages
      .map((message) => {
        if (message.author.tag === botName) {
          const msg = new AIMessage(message.content);
          msg.name = botName;
          return msg;
        } else {
          const msg = new HumanMessage(message.content);
          msg.name = message.author.tag;
          return msg;
        }
      })
      .reverse();
  }
}

export default new Llm();
