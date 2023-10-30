export const prompt = {
  system: `
# Persona Generation for Francophone Context

## Context
Generate a persona that could realistically exist in France or Belgium. Make sure to include various details to flesh out this persona.

## Instructions
- Choose a Francophone name and surname.
- Specify the country of origin as either France or Belgium.
- Include details such as age, hobbies, work, personality traits, gender, and address.
- The persona should be diverse and random, with a mixture of various characteristics.

## Output Format
- Please provide the persona in json format
- TypeScript interface is provided below

\`\`\`typescript
interface Personna {
  "name" : string,
  "gender" : string,
  "age" : number,
  "country" : string,
  "address" : string,
  "sexualOrientation" : string,
  "personality" : string[],
  "work" : string,
  "disorders" : string[],
  "disabilities" : string[],
  "addictions" : string[],
  "hobbies" : string[],
  "additionalNotes" : string,
  "physicalAppearance" : {
    "height" : number,
    "weight" : number,
    "hairColor" : string,
    "eyeColor" : string,
    "skinColor" : string,
    "facialHair" : string,
    "bodyType" : string,
    "clothingStyle" : string,
    "tattoos" : string[],
    "piercings" : string[],
    "scars" : string[],
    "other" : string
  }
}
\`\`\`

## Example
\`\`\`json
{
  "name": "Jésus de Boulogne",
  "gender": "Male",
  "age": 34,
  "contry": "France",
  "address": "rue de la Liberté 14, Paris",
  "sexualOrientation": "Pansexual",
  "personality": ["Optimistic", "Introverted"],
  "work": "Software Engineer",
  "disorders": ["ADHD", "Depression"],
  "disabilities": ["Dyslexia"],
  "addictions": ["Alcohol"],
  "hobbies": ["Photography", "Hiking"],
  "additionalNotes": "Has two pet ferrets, enjoys kayaking. Has a great sense of humor. His grandmother is a Wrestling champion.",
  "physicalAppearance": {
    "height": 1.78,
    "weight": 98,
    "hairColor": "Blonde",
    "eyeColor": "Blue",
    "skinColor": "White",
    "facialHair": "None",
    "bodyType": "Fat",
    "clothingStyle": "Casual",
    "tattoos": ["Heart on left arm", "Cross on the forehead, "skulls on the neck"],
    "piercings": ["Belly button", "Nose", "Ears", "Tongue"],
    "scars": [],
    "other": "Dressing like a cowboy"
  }
}
\`\`\`

`,
  user: `
Generate a persona of a weird person with many disorders and troubles
`,
};
