import llm from "../llm.js";
import { prompt } from "./prompt.js";
import { HumanMessage, SystemMessage, BaseMessage } from "../Messages.js";
import { Models } from "../models.js";

export const decide = async (history: BaseMessage[]): Promise<Decision> => {
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  let retry: number = 0;
  let matches: RegExpMatchArray | null = null;

  let res = await callDecide(history, datetimeString);

  const result = (await JSON.parse(res)) as Decision;

  return result;
};

const callDecide = (
  history: BaseMessage[],
  datetimeString: string
): Promise<string> =>
  llm.completion(
    [
      new SystemMessage(prompt.system(llm.persona, datetimeString)),
      ...history,
      new HumanMessage("Decide your next action. Reply in json format."),
    ],
    Models.Gpt3,
    true
  );

export interface Decision {
  reason: string;
  action: "reply" | "none";
}
