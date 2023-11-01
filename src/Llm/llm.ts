import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema";
import { Message, Collection, Snowflake } from "discord.js";
import { StringOutputParser } from "langchain/schema/output_parser";
import { Models } from "./models.js";
import { Persona, fromObject } from "./Persona/Persona.js";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

class Llm {
  llm: ChatOllama;
  persona: Persona;
  personas: Persona[];
  botId: string;

  constructor() {
    this.botId = "";
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: Models.OpenHermes2Mistra,
    });

    this.persona = {} as Persona;
    this.personas = [];
  }

  async loadPersonas(): Promise<void> {
    const storage = createStorage({ driver: fsDriver({ base: "./data" }) });

    let json = ((await storage.getItem("personas.json")) as any[]).map(
      (p: any) => fromObject(p)
    );
    if (json === null) {
      throw new Error("No personas found, use `npm run generate` first");
    }

    this.personas = json;
  }

  async stream(history: BaseMessage[]): Promise<string> {
    const stream = await this.llm
      .pipe(new StringOutputParser())
      .stream(history);

    const chunks = [];
    try {
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
    } catch (error: any) {
      console.error(error);
      throw error;
    }

    let answer = chunks.join("");

    return answer;
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
  }
}

export default new Llm();