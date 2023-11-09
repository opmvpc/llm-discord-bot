import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { GlobalConfig } from "./GlobalConfig.js";

export const create = async (
  n: number = 5,
  imageGeneration: boolean = false
): Promise<void> => {
  const storage = createStorage({
    driver: fsDriver({ base: `./data` }),
  });

  const config = ((await storage.getItem("globalConfig.json")) ??
    {}) as GlobalConfig;

  if (config.llm === "ollama") {
    // const { create } = await import("./Llm/Olama/Persona/personasGenerator.js");
    // create(n, imageGeneration);
  } else {
    const { create } = await import("./Llm/Gpt/Persona/personasGenerator.js");
    create(n, imageGeneration);
  }
};

create(5, true);
