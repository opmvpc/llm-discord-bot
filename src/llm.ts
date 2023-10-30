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
import { Models } from "./models";

class Llm {
  llm: ChatOllama;
  persona: string;
  personas: string[];

  constructor() {
    console.log("Llm");
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: Models.Mistral,
    });
    this.persona = "";
    this.personas = [];
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

    // cut everything after [INST] included
    const index = answer.indexOf("[INST]");

    if (index > 0) {
      answer = answer.substring(0, index);
    }

    return answer;
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

  async generatePersonas(n: number = 5): Promise<void> {
    for (let i = 0; i < n; i++) {
      const persona = await this.stream([
        new SystemMessage(prompts.persona.system),
        new HumanMessage(prompts.persona.user),
      ]);
      this.personas.push(persona);
    }

    // random personality
    const index = Math.floor(Math.random() * this.personas.length);
    this.persona = this.personas[index];
  }

  async chat(
    messages: Collection<Snowflake, Message>,
    botName: string
  ): Promise<string> {
    const history = await this.formatHistory(messages, "You");
    const datetimeString = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
    });

    return this.stream([
      new SystemMessage(prompts.chat.system(this.persona, datetimeString)),
      ...history,
    ]);
  }

  async chatWithPersona(
    messages: Collection<Snowflake, Message>
  ): Promise<string> {
    const history = await this.formatHistory(messages, "You");
    const datetimeString = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
    });

    // get an answer from the persona
    let res = await this.stream([
      new SystemMessage(prompts.chat.system(this.persona, datetimeString)),
      ...history,
    ]);

    // verify the answer with the user
    res = await this.verifyReply(res);
    res = await this.verifyReply(res);
    // res = await this.translate(res, "fr");

    return res;
  }

  async translate(text: string, to: "fr" | "en"): Promise<string> {
    return this.stream([
      new SystemMessage(prompts.translate.system(to)),
      new HumanMessage(text),
    ]);
  }

  async decideAction(
    messages: Collection<Snowflake, Message>
  ): Promise<"reply" | "none"> {
    const history = await this.formatHistory(messages, "You");
    const datetimeString = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
    });

    const decide = (): Promise<string> =>
      this.stream([
        new SystemMessage(
          prompts.decideAction.system(this.persona, datetimeString)
        ),
        ...history,
        new HumanMessage("Decide your next action. Reply in json format."),
      ]);

    let res = await decide();

    console.log("decideAction :" + res);

    let matches: RegExpMatchArray | null = null;
    do {
      // get action from res
      matches = res.match(/"action": "(reply|none)"/);
      if (matches && matches.length > 1) {
        if (matches[1] === "reply") {
          console.log("action : reply");
          return "reply";
        }
        console.log("action : none");
        return "none";
      }

      // ask again
      console.log("deciding again");
      res = await decide();
    } while (matches === null);

    throw new Error("No action found");
  }

  async verifyReply(reply: string): Promise<string> {
    const datetimeString = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
    });

    return this.stream([
      new SystemMessage(
        prompts.verifyAction.system(this.persona, datetimeString)
      ),
      new HumanMessage(reply),
    ]);
  }
}

export default new Llm();
