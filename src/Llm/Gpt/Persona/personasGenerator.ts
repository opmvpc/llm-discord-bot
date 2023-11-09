import llm from "../llm.js";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { prompt } from "./prompt.js";
import { Persona, from } from "./Persona.js";
import { sdxl } from "./Sdxl/sdxl.js";
import "dotenv/config";
import { HumanMessage, SystemMessage } from "../Messages.js";
import { Models } from "../models.js";
import { image as download } from "image-downloader";
import fs from "fs/promises";
import { GlobalConfig } from "../../../GlobalConfig.js";
import path from "path";

export const create = async (
  n: number = 5,
  imageGeneration: boolean = false
): Promise<void> => {
  const timestamp = Date.now();

  try {
    await fs.access(`./data/generations/${timestamp}`);
  } catch {
    await fs.mkdir(`./data/generations/${timestamp}`);
  }

  let storage = createStorage({
    driver: fsDriver({ base: `./data` }),
  });

  const bots = ((await storage.getItem("globalConfig.json")) ??
    {}) as GlobalConfig;
  bots.lastGeneration = timestamp;
  bots.lastPersona = 0;
  await storage.setItem("globalConfig.json", JSON.stringify(bots, null, 2));

  storage = createStorage({
    driver: fsDriver({ base: `./data/generations/${timestamp}` }),
  });

  console.log(`Génération de ${n} personas...`);
  const personas = await generate(n, imageGeneration, timestamp);
  console.log(`Génération terminée.`);

  if (personas.length === 0) {
    throw new Error("No personas generated");
  }

  console.log("Personas générés :");
  let buffer = "";
  for (const persona of personas) {
    buffer += `  - ${persona.name}\n`;
  }
  console.log(buffer);

  await storage.setItem("personas.json", JSON.stringify(personas, null, 2));

  console.log(`Personas enregistrés dans ./data/generations/${timestamp}`);
};

const generate = async (
  n: number = 5,
  imageGeneration: boolean = false,
  timestamp: number
): Promise<Persona[]> => {
  const personas: Persona[] = [];
  for (let i = 0; i < n; i++) {
    let jsonIsValid = false;
    let jsonPersona: string;
    let persona: Persona | undefined;
    do {
      try {
        jsonPersona = await llm.completion(
          [new SystemMessage(prompt.system), new HumanMessage(prompt.user)],
          Models.Gpt3,
          true
        );
        persona = from(jsonPersona);
        jsonIsValid = true;
      } catch (error) {
        console.log("Error parsing JSON, retrying...");
        jsonIsValid = false;
      }
    } while (!jsonIsValid);

    if (persona === undefined) {
      throw new Error("JSON is undefined");
    }

    if (imageGeneration === true) {
      console.log("Génération de l'image...");
      const imgPath = path.resolve(`data/generations/${timestamp}/${i}.png`);

      const imgUrl = await sdxl(persona);
      persona.img = {
        url: imgUrl,
        path: imgPath,
        base64: "",
      };
      console.log("Image générée.");

      const options = {
        url: imgUrl,
        dest: imgPath,
      };

      const res = await download(options);
      console.log(res);

      // save base64
      // persona.img.base64 = JSON.stringify(
      //   await fs.readFile(persona.img.path, "base64")
      // );
    }

    console.log(
      `${i + 1}. ${persona.name} : ${persona?.img?.url ?? "No image"}`
    );

    personas.push(persona);
  }
  return personas;
};
