import { Persona } from "../Persona";

export const prompt = {
  system: (persona: Persona) => `
# Generate Profile Images with Stable Diffusion XL

## Context
You are tasked with generating a profile image using Stable Diffusion XL based on a given persona's description in JSON format. The persona is detailed in various attributes like name, gender, age, work, and physical appearance.

## Instructions
1. Extract relevant information from the Persona JSON.
2. Convert the extracted details into a rich list of keywords, synonyms, and related phrases, separated by commas and periods for compatibility with Stable Diffusion XL.
3. Include a color palette that aligns with the persona's style or description.
4. Specify the style in which the image should be generated (e.g., photo-realistic, painted portrait, cute avatar, etc.).
5. Generate a text output that Stable Diffusion XL can use to generate the profile image.

## Output Format
- Please output the persona-based description in a keyword-rich and detailed list, separated by commas and periods.
- only output the text, without any metadata.
- Please specify the color palette and style in the description.

## Rules
1. The description should contain keywords related to physical appearance.
2. Include personality traits that might reflect in facial expressions or body language.
3. The clothing style should be briefly mentioned and elaborated upon.
4. Include accessories like tattoos, piercings, and scars if mentioned in the persona's description.
5. Make use of synonyms and related phrases to enrich the description.
6. Specify a color palette based on the persona's attributes or style.
7. Define the style of the image (e.g., photo-realistic, painted portrait, cute avatar).
8. IMPORTANT: RESPECT THE GENDER OF THE PERSONA.

## Examples

### Example 1: Man with Artistic Style

#### Input
\`\`\`json
{
  "name": "Yann Leclerc",
  "gender": "male",
  "physicalAppearance": {
    "hairColor": "brown",
    "eyeColor": "green",
    "bodyType": "slim",
    "clothingStyle": "artistic",
    "tattoos": [],
    "piercings": ["lip"],
    "scars": ["visible"]
  },
  "personality": ["narcissistic", "socially anxious"]
}
\`\`\`

#### Output

Portrait of a white male, slim, slender, brown hair, brunette, green eyes, emerald gaze, artistic clothing, creative attire, vivid colors, lip piercing, labret, visible scars, narcissistic, self-absorbed, socially anxious, introverted. Color Palette: Greens and Browns. Style: Photo-realistic. Professional photography. 30mm.

### Example 2: Eccentric Writer

#### Input

\`\`\`json
{
  "name": "Martine Dubois",
  "gender": "female",
  "physicalAppearance": {
    "hairColor": "black",
    "eyeColor": "brown",
    "bodyType": "slim",
    "clothingStyle": "bohemian",
    "tattoos": ["notable"],
    "piercings": ["everywhere"],
    "scars": []
  },
  "personality": ["eccentric"],
  "work": "writer"
}
\`\`\`

#### Output

Portrait of an eccentric female writer, slim physique, black hair, raven locks, brown eyes, hazel gaze, bohemian clothing, free-spirited attire, notable tattoos, inked, quirky. piercing everywhere on face, nose, mouth, ears. Color Palette: Earth Tones. Style: Painted Portrait. Expressionist brush strokes.

### Example 3: Cyberpunk Gamer

#### Input

\`\`\`json

{
  "name": "Pixel",
  "gender": "non-binary",
  "physicalAppearance": {
    "hairColor": "purple",
    "eyeColor": "cybernetic",
    "bodyType": "average",
    "clothingStyle": "cyberpunk",
    "tattoos": ["circuit patterns"],
    "piercings": ["earlobes", "nose"],
    "scars": ["none"]
  },
  "personality": ["rebellious", "inquisitive"],
  "hobbies": ["gaming"]
}
\`\`\`

#### Output

Portrait of a non-binary individual named Pixel, average build, purple hair, lavender locks, cybernetic eyes, LED gaze, cyberpunk attire, futuristic clothing, circuit pattern tattoos, earlobe and nose piercings. Rebellious, inquisitive, gamer. Color Palette: Neon Blues and Purples. Style: CGI Avatar. Holographic background. 3D render. 4K resolution.

## Persona

\`\`\`json
${persona}
\`\`\`

`,
  user: `
Generate the description of a profile image for the given persona.
`,
};
