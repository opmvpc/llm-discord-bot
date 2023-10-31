import { Collection, Message, Snowflake } from "discord.js";
import llm from "../llm.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import prompts from "./prompts.js";

export const chatWithPersona = async (
  messages: Collection<Snowflake, Message>
): Promise<string> => {
  const history = await llm.formatHistory(messages);
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  // get an answer from the persona
  let res = await llm.stream([
    new SystemMessage(prompts.chat.system(llm.persona, datetimeString)),
    ...history,
  ]);

  // verify the answer with the user
  // res = await llm.verifyReply(res);
  // res = await llm.verifyReply(res);
  // res = await llm.translate(res, "fr");

  return res;
};

const verifyReply = async (reply: string): Promise<string> => {
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  return llm.stream([
    new SystemMessage(prompts.verifyAction.system(llm.persona, datetimeString)),
    new HumanMessage(reply),
  ]);
};
