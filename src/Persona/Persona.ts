class Persona {
  constructor(
    public name: string,
    public gender: string,
    public age: number,
    public country: string,
    public address: string,
    public sexualOrientation: string,
    public personality: string[],
    public work: string,
    public disorders: string[],
    public disabilities: string[],
    public addictions: string[],
    public hobbies: string[],
    public additionalNotes: string,
    public physicalAppearance: {
      height: number;
      weight: number;
      hairColor: string;
      eyeColor: string;
      skinColor: string;
      facialHair: string;
      bodyType: string;
      clothingStyle: string;
      tattoos: string[];
      piercings: string[];
      scars: string[];
      other: string;
    },
    public imgUrl?: string
  ) {}

  public json(): string {
    return JSON.stringify(this, null, 2);
  }
}

export type { Persona };

export const from = (json: string): Persona => {
  // strip everything before the first {
  json = json.includes("{") ? json.substring(json.indexOf("{")) : json;
  // strip everything after the last }
  json = json.includes("}")
    ? json.substring(0, json.lastIndexOf("}") + 1)
    : json;

  const jsonPersonna = JSON.parse(json);

  const personna: Persona = new Persona(
    jsonPersonna.name,
    jsonPersonna.gender,
    jsonPersonna.age,
    jsonPersonna.country,
    jsonPersonna.address,
    jsonPersonna.sexualOrientation,
    jsonPersonna.personality,
    jsonPersonna.work,
    jsonPersonna.disorders,
    jsonPersonna.disabilities,
    jsonPersonna.addictions,
    jsonPersonna.hobbies,
    jsonPersonna.additionalNotes,
    jsonPersonna.physicalAppearance
  );

  return personna;
};
