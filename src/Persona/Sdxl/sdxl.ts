import Replicate from "replicate";
import { Persona } from "../Persona.js";
import llm from "../../llm.js";
import { prompt } from "./prompt.js";
import { HumanMessage, SystemMessage } from "langchain/schema";

export const sdxl = async (persona: Persona): Promise<string> => {
  // generate prompt
  const res = await llm.stream([
    new SystemMessage(prompt.system(persona)),
    new HumanMessage(prompt.user),
  ]);

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  });

  const input: SdxlInput = {
    prompt: res,
    negative_prompt: "camera, phone, objective",
    height: 768,
    width: 768,
    num_outputs: 1,
    num_inference_steps: 30,
    guidance_scale: 7,
    scheduler: "K_EULER_ANCESTRAL",
    refine: "base_image_refiner",
  };

  const output = (await replicate.run(
    "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
    {
      input,
    }
  )) as string[];

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
