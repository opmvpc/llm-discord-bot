import {
  Message,
  Client,
  Events,
  IntentsBitField,
  EmbedBuilder,
  ActivityType,
} from "discord.js";
import llm from "./llm.js";
import "dotenv/config";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { Persona, fromObject } from "./Persona/Persona.js";
import { decide } from "./DecideAction/decide.js";
import { chatWithPersona } from "./Chat/chat.js";

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
  await switchPersona();
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
    const messages = await message.channel.messages.fetch({ limit: 20 });

    // decideAction
    const action = await decide(messages);
    if (action === "none") {
      return;
    }

    // @ts-ignore - DiscordJS types are wrong
    message.channel.sendTyping();
    console.log("génération de la réponse");

    const reply = (await chatWithPersona(messages)) ?? "No reply";
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
  const storage = createStorage({ driver: fsDriver({ base: "./data" }) });

  let json = ((await storage.getItem("personas.json")) as any[]).map((p: any) =>
    fromObject(p)
  );
  if (json === null) {
    throw new Error("No personas found, use `npm run generate` first");
  }

  llm.personas = json;

  let token: string;

  if (process.env.NODE_ENV === "production") {
    token = process.env.DISCORD_SECRET_PROD || "";
  } else {
    token = process.env.DISCORD_SECRET_DEV || "";
  }

  client.login(token);
};

const switchPersona = async () => {
  console.log("Changement de personnalité");
  await llm.getRandomPersona();
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

  if (client.user?.avatarURL() !== persona.imgUrl) {
    try {
      await client.user?.setAvatar(
        persona.imgUrl ??
          "https://cdn.discordapp.com/app-icons/1168230047870636173/febd01a5ad27aaaaa4fd1b715caf018c.png?size=256"
      );
    } catch (error: any) {
      console.log("Error setting avatar");
    }
  }
};

const sendPersonaEmbed = async (message: Message) => {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Bot connecté")
    .setDescription(`Je suis prêt ! Connecté en tant que ${botName}`)
    .addFields(
      { name: "Model", value: llm.llm.model },
      {
        name: "Personnalité",
        value: `
        Nom : ${llm.persona.name}
        Age : ${llm.persona.age}
        Genre : ${llm.persona.gender}
        Pays : ${llm.persona.country}
        `,
      }
    )
    .setColor("#0099ff")
    .setImage(
      llm.persona.imgUrl ??
        "https://cdn.discordapp.com/app-icons/1168230047870636173/febd01a5ad27aaaaa4fd1b715caf018c.png?size=256"
    );

  message.channel.send({ embeds: [embed] });
};

await main();
