import { HumanMessage, SystemMessage } from "langchain/schema";
import llm from "../llm";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { prompt } from "./prompt";
import { Personna, from } from "./Persona";

const create = async (n: number = 5): Promise<void> => {
  console.log(`Génération de ${n} personas...`);
  const personas = await generate(n);
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

const generate = async (n: number = 5): Promise<Personna[]> => {
  const personas: Personna[] = [];
  for (let i = 0; i < n; i++) {
    let jsonIsValid = false;
    let jsonPersona: string;
    let persona: Personna | undefined;
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
    personas.push(persona);
  }
  return personas;
};

create(10);
