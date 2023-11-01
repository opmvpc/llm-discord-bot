import { HumanMessage, SystemMessage } from "langchain/schema";
import llm from "../llm.js";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { prompt } from "./prompt.js";
import { Persona, from } from "./Persona.js";
import { sdxl } from "./Sdxl/sdxl.js";
import "dotenv/config";

export const create = async (
  n: number = 5,
  imageGeneration: boolean = false
): Promise<void> => {
  console.log(`Génération de ${n} personas...`);
  const personas = await generate(n, imageGeneration);
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

  const storage = createStorage({ driver: fsDriver({ base: "./data" }) });

  await storage.setItem("personas.json", JSON.stringify(personas, null, 2));

  console.log("Personas enregistrés dans ./data/personas.json");
};

const generate = async (
  n: number = 5,
  imageGeneration: boolean = false
): Promise<Persona[]> => {
  const personas: Persona[] = [];
  for (let i = 0; i < n; i++) {
    let jsonIsValid = false;
    let jsonPersona: string;
    let persona: Persona | undefined;
    do {
      try {
        jsonPersona = await llm.stream([
          new SystemMessage(prompt.system),
          new HumanMessage(prompt.user),
        ]);
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
      const imgUrl = await sdxl(persona);
      persona.imgUrl = imgUrl;
      console.log("Image générée.");
    }

    console.log(`${i + 1}. ${persona.name} : ${persona.imgUrl ?? "No image"}`);

    personas.push(persona);
  }
  return personas;
};

create(10, true);
