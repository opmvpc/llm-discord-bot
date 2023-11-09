import { BaseMessage, HumanMessage, SystemMessage } from "../Messages.js";
import llm from "../llm.js";
import prompts from "./prompts.js";

export const chatWithPersona = async (
  history: BaseMessage[]
): Promise<string> => {
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  // get an answer from the persona
  let res = await llm.completion([
    new SystemMessage(prompts.chat.system(llm.persona, datetimeString)),
    ...history,
  ]);

  return res;
};

const verifyReply = async (reply: string): Promise<string> => {
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  return llm.completion([
    new SystemMessage(prompts.verifyAction.system(llm.persona, datetimeString)),
    new HumanMessage(reply),
  ]);
};
