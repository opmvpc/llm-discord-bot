import Replicate from "replicate";
import { Persona } from "../Persona.js";
import llm from "../../llm.js";
import { prompt } from "./prompt.js";
import { HumanMessage, SystemMessage } from "../../Messages.js";

export const sdxl = async (persona: Persona): Promise<string> => {
  // generate prompt
  const res = await llm.completion([
    new SystemMessage(prompt.system(persona)),
    new HumanMessage(prompt.user),
  ]);

  console.log("prompt : ", res);

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  });

  let negativePrompt =
    "diagram, screen, app, program, operating system, website,text, watermarks, logos, signatures.";
  if (persona.gender.toUpperCase() === "MALE") {
    negativePrompt += " female, woman, girl, lady, feminine";
  } else if (persona.gender.toUpperCase() === "FEMALE") {
    negativePrompt += " male, man, boy, gentleman, masculine";
  }

  const input: SdxlInput = {
    prompt: res,
    negative_prompt: negativePrompt,
    height: 768,
    width: 768,
    num_outputs: 1,
    num_inference_steps: 30,
    guidance_scale: 8,
    scheduler: "K_EULER_ANCESTRAL",
    refine: "base_image_refiner",
  };

  let output: string[] = [];
  let isOk = false;

  do {
    try {
      output = (await replicate.run(
        "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        {
          input,
        }
      )) as string[];
      isOk = true;
    } catch (error) {
      console.log("Error generating image, retrying...");
      isOk = false;
    }
  } while (!isOk);

  if (output.length === 0) {
    throw new Error("No output generated");
  }

  return output[0];
};

type SdxlInput = {
  prompt: string;
  negative_prompt: string;
  height: number;
  width: number;
  num_outputs: number;
  num_inference_steps: number;
  guidance_scale: number;
  scheduler: "K_EULER_ANCESTRAL" | "K_EULER" | "DDIM";
  refine: "no-refiner" | "base_image_refiner";
};
