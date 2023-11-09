import {
  Message,
  Client,
  Events,
  IntentsBitField,
  EmbedBuilder,
  ActivityType,
} from "discord.js";

import fs from "fs/promises";

import "dotenv/config";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

import { OllamaLlm } from "./Llm/Olama/llm.js";
import { GptLlm } from "./Llm/Gpt/llm.js";
import { GlobalConfig } from "./GlobalConfig.js";
import { Persona } from "./Llm/Olama/Persona/Persona.js";

const intents = new IntentsBitField();
intents.add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMessageReactions,
  IntentsBitField.Flags.MessageContent
);
// Create a new client instance
const client = new Client({
  intents,
});

let botName: string;
let botId: string;

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c: Client) => {
  console.log(`Ready! Logged in as ${c.user?.tag}`);
  botName = c.user?.tag || "Bot";
  botId = c.user?.id || "0";
  llm.botId = botId;
  await switchPersona(config.lastPersona);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.id === botId) {
    return;
  }

  if (llm.persona === undefined) {
    message.reply("Je ne suis pas encore prêt.e !");
    return;
  }

  if (message.content === "!hello") {
    await sendPersonaEmbed(message);
    return;
  }

  if (message.content === "!switch") {
    //switch persona
    await switchPersona();
    await sendPersonaEmbed(message);
    return;
  }

  try {
    // @ts-ignore - DiscordJS types are wrong
    const messages = await message.channel.messages.fetch({ limit: 10 });
    const history = await llm.formatHistory(messages);
    // @ts-ignore
    const action = await llm.decide(history);
    if (action === "none") {
      return;
    }

    // @ts-ignore - DiscordJS types are wrong
    message.channel.sendTyping();
    console.log("génération de la réponse");

    // @ts-ignore
    const reply = (await llm.chatWithPersona(history)) ?? "No reply";
    console.log(reply);
    message.reply(reply);
  } catch (error: any) {
    message.reply(error.message ?? "Error");
    console.error(error);
  }

  if (message.content === "ping") {
    message.reply("pong");
  }
});

const main = async () => {
  await llm.loadPersonas();

  let token: string;

  if (process.env.NODE_ENV === "production") {
    token = process.env.DISCORD_SECRET_PROD || "";
  } else {
    token = process.env.DISCORD_SECRET_DEV || "";
  }

  client.login(token);
};

const switchPersona = async (lastPersonaId: number | null = null) => {
  console.log(lastPersonaId);

  if (lastPersonaId !== null) {
    console.log("Chargement de la dernière personnalité");
    await llm.getPersona(lastPersonaId);
  } else {
    console.log("Changement de personnalité");
    await llm.getRandomPersona();
  }
  const persona = llm.persona as Persona;
  console.log(`Persona sélectionné : ${persona.name}`);

  if (client.user?.username !== persona.name) {
    try {
      await client.user?.setUsername(persona.name);
    } catch (error: any) {
      console.log("Error setting username");
    }
  }

  client.user?.setActivity({
    name: `${persona.name}`,
    type: ActivityType.Playing,
    state: `Age : ${persona.age} | Gender : ${persona.gender} | Country : ${persona.country}`,
  });

  // todo check comment distinguer les images
  // if (client.user?.avatarURL() !== persona.img) {
  try {
    await client.user?.setAvatar(
      (await persona.getBase64Avatar()) ??
        "https://cdn.discordapp.com/app-icons/1168230047870636173/febd01a5ad27aaaaa4fd1b715caf018c.png?size=256"
    );
  } catch (error: any) {
    console.log("Error setting avatar");
  }
  // }
};

const sendPersonaEmbed = async (message: Message) => {
  const imgBuffer = await fs.readFile(llm.persona?.img?.path ?? "");

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Bot connecté")
    .setDescription(`Je suis prêt ! Connecté en tant que ${botName}`)
    .addFields({
      name: "Personnalité",
      value: `
        Nom : ${llm.persona.name}
        Age : ${llm.persona.age}
        Genre : ${llm.persona.gender}
        Pays : ${llm.persona.country}
        `,
    })
    .setColor("#0099ff")
    .setImage("attachment://avatar.png");

  message.channel.send({
    embeds: [embed],
    files: [{ attachment: imgBuffer, name: "avatar.png" }],
  });
};

const storage = createStorage({ driver: fsDriver({ base: "./data" }) });
const config: GlobalConfig = (await storage.getItem(
  "globalConfig.json"
)) as GlobalConfig;

let llm: OllamaLlm | GptLlm;

const llmType = config.llm ?? "gpt";
if (llmType === "gpt") {
  const { default: gptllm } = await import("./Llm/Gpt/llm.js");
  llm = gptllm;
} else {
  const { default: ollamallm } = await import("./Llm/Olama/llm.js");
  llm = ollamallm;
}

await main();
