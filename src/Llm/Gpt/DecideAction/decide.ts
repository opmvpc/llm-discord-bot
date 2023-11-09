import llm from "../llm.js";
import { prompt } from "./prompt.js";
import { HumanMessage, SystemMessage, BaseMessage } from "../Messages.js";
import { Models } from "../models.js";

export const decide = async (
  history: BaseMessage[]
): Promise<"reply" | "none"> => {
  const datetimeString = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  let retry: number = 0;
  let matches: RegExpMatchArray | null = null;
  const maxRetry = 5;
  do {
    if (retry > maxRetry) {
      console.log("Too many retries");
      return "none";
    }
    if (retry > 0) {
      console.log(`retrying... (${retry}/${maxRetry})`);
    }
    // console.log(llm.persona);
    let res = await callDecide(history, datetimeString);

    console.log(res);

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

    retry++;
  } while (matches === null);

  throw new Error("No action found");
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
