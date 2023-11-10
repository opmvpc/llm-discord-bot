import { Message, Collection, Snowflake } from "discord.js";
import { Models } from "./models.js";
import { Persona, fromObject } from "./Persona/Persona.js";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import OpenAI from "openai";
import { AIMessage, BaseMessage, HumanMessage } from "./Messages.js";
import "dotenv/config";
import { Decision, decide } from "./DecideAction/decide.js";
import { chatWithPersona } from "./Chat/chat.js";
import { GlobalConfig } from "../../GlobalConfig.js";

export class GptLlm {
  llm: OpenAI;
  persona: Persona;
  personas: Persona[];
  botId: string;

  constructor() {
    this.botId = "";
    this.llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.persona = {} as Persona;
    this.personas = [];
  }

  async loadPersonas(): Promise<void> {
    const storage = createStorage({ driver: fsDriver({ base: "./data" }) });

    const config = (await storage.getItem("globalConfig.json")) as GlobalConfig;

    let json = (
      (await storage.getItem(
        `generations/${config.lastGeneration}/personas.json`
      )) as any[]
    ).map((p: any) => fromObject(p));
    if (json === null) {
      throw new Error("No personas found, use `npm run generate` first");
    }

    this.personas = json;
  }

  async completion(
    history: BaseMessage[],
    model: Models = Models.Gpt3,
    jsonMode: boolean = false
  ): Promise<string> {
    history = history.map((message) => {
      if (message instanceof HumanMessage || message instanceof AIMessage) {
        return {
          role: message.role,
          content: `${message.name}: ${message.content}`,
        };
      } else {
        return {
          role: message.role,
          content: message.content,
        };
      }
    });

    const answer = await this.llm.chat.completions.create({
      messages: history,
      model: model,
      response_format: {
        type: jsonMode ? "json_object" : "text",
      },
    });

    let text = answer.choices[0].message.content ?? "";

    if (text.startsWith(`${this.persona.name}: `)) {
      text = text.substring(`${this.persona.name}: `.length);
    }

    return text;
  }

  async formatHistory(
    messages: Collection<Snowflake, Message>
  ): Promise<BaseMessage[]> {
    return messages
      .map((message) => {
        if (message.author.id === this.botId) {
          const msg = new AIMessage(message.content);
          msg.name = this.persona.name;
          return msg;
        } else {
          const msg = new HumanMessage(message.content);
          msg.name = message.author.username;
          return msg;
        }
      })
      .reverse();
  }

  async getRandomPersona(): Promise<void> {
    const index = Math.floor(Math.random() * this.personas.length);
    this.persona = this.personas[index];

    const storage = createStorage({ driver: fsDriver({ base: "./data" }) });

    const config = (await storage.getItem("globalConfig.json")) as GlobalConfig;
    config.lastPersona = index;

    await storage.setItem("globalConfig.json", JSON.stringify(config, null, 2));
  }

  async getPersona(lastPersonna: number): Promise<void> {
    this.persona = this.personas[lastPersonna];
  }

  async decide(history: BaseMessage[]): Promise<Decision> {
    return await decide(history);
  }

  async chatWithPersona(history: BaseMessage[]): Promise<string> {
    return await chatWithPersona(history);
  }
}

export default new GptLlm();
