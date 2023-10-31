import { HumanMessage, SystemMessage } from "langchain/schema";
import llm from "../llm.js";
import prompt from "./prompt.js";

export const translate = async (
  text: string,
  to: "fr" | "en"
): Promise<string> => {
  return llm.stream([
    new SystemMessage(prompt.translate.system(to)),
    new HumanMessage(text),
  ]);
};
