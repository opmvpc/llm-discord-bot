import { Persona } from "../Persona";

export const prompt = {
  system: (persona: Persona) => `
# Generate Profile Images with Stable Diffusion XL

## Context
You are tasked with generating a profile image using Stable Diffusion XL based on a given persona's description in JSON format. The persona is detailed in various attributes like name, gender, age, work, and physical appearance.

## Instructions
1. Extract relevant information from the Persona JSON.
2. Convert the extracted details into a rich list of keywords, synonyms, and related phrases, separated by commas and periods for compatibility with Stable Diffusion XL.
3. Include a color palette that is both distinct and varied, aligning with the persona's style or attributes.
4. Specify the style in which the image should be generated (e.g., photo-realistic, painted portrait, cute avatar, etc.).
5. Generate a text output that Stable Diffusion XL can use to generate the profile image.

## Output Format
- Please output the persona-based description in a keyword-rich and detailed list, separated by commas and periods.
- Only output the text, without any metadata.
- Please specify the color palette and style in the description.

## Rules
1. The description should contain keywords related to physical appearance.
2. Include personality traits that might reflect in facial expressions or body language.
3. The clothing style should be briefly mentioned and elaborated upon.
4. Include accessories like tattoos, piercings, and scars if mentioned in the persona's description.
5. Make use of synonyms and related words to enrich the description.
6. Specify a diverse color palette based on the persona's attributes or style. (e.g., warm hues for a friendly persona, cool hues for a shy persona, mix of colors, gradients, grayscale, etc.)
7. Define the style of the image (e.g., photo-realistic, painted portrait, cute avatar, selfie, painting, 3D model, etc.)
8. IMPORTANT: ACCURATELY RESPECT THE GENDER OF THE PERSONA.
9. Include a pose or facial expression that is consistent with the persona's attributes.
10. Add keywords to describe if the persona is attractive, ugly, or average-looking.


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

Selfie of a white male, slim, slender, brown hair, brunette, green eyes, emerald gaze, artistic clothing, creative attire, vivid colors, lip piercing, labret, visible scars, narcissistic, self-absorbed, socially anxious, introverted. repulsive. terrible. smiling. mad smile. crazy looking. Color Palette: Greens, Browns, and Earth Tones. Style: Photo-realistic. Professional photography. 30mm.

### Example 2: Eccentric Writer

#### Input

\`\`\`json
{
  "name": "Martine Dubois",
  "gender": "female",
  "physicalAppearance": {
    "hairColor": "pink",
    "eyeColor": "blue",
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

Portrait of a female. slim physique, pink hair, raven locks, blue eyes, hazel gaze, bohemian clothing, free-spirited attire, notable tattoos, inked, quirky. Piercing everywhere on face, nose, mouth, ears. good looking. gorgeous woman. Intense gaze. Color Palette: Earth Tones, Warm Hues, and Gold Accents. Style: Painted Portrait. Expressionist brush strokes. Oil on canvas. black Frame.

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

Avatar of a person. average build, purple hair, lavender locks, cybernetic eyes, LED gaze, cyberpunk attire, futuristic clothing, circuit pattern tattoos, earlobe and nose piercings. Nerdy glasses. makeup. weak. malnourish. bad looking. Yoga pose. Color Palette: Neon Blues, Purples, and Rainbow Gradients. Style: Cute Avatar. 8-bit pixel art.


## Persona

\`\`\`json
${persona.json()}
\`\`\`

`,
  user: `
Generate the description of a profile image for the given persona.
`,
};
