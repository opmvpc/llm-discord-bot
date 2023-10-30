import Replicate from "replicate";

export const sdxl = async (prompt: string): Promise<void> => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  });

  const input: SdxlInput = {
    prompt,
    negative_prompt: "",
    num_outputs: 1,
    num_inference_steps: 25,
    guidance_scale: 6,
  };

  const output: SdxlOutput = (await replicate.run(
    "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
    {
      input,
    }
  )) as SdxlOutput;

  console.log(output);
};

type SdxlInput = {
  prompt: string;
  negative_prompt: string;
  num_outputs: number;
  num_inference_steps: number;
  guidance_scale: number;
};

type SdxlOutput = {
  type: string;
  items: {
    type: string;
    format: string;
  };
  title: string;
};
