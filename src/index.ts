import {
  Message,
  Client,
  Events,
  IntentsBitField,
  EmbedBuilder,
  ActivityType,
  PresenceManager,
  Presence,
} from "discord.js";
import llm from "./llm";
import "dotenv/config";

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
  console.log("génération des personnalités");
  await llm.generatePersonas();
  console.log("personnalités générées");
  console.log("Persona sélectionné :");
  console.log(llm.persona);

  // get persona name with regex (ex: "Name": "Clémentine Dupont")
  const personaName = llm.persona.match(/"Name": "(.*)"/)?.[1] ?? "Unknown";
  const country = llm.persona.match(/"Country": "(.*)"/)?.[1] ?? "Unknown";
  const age = llm.persona.match(/"Age": (.*),/)?.[1] ?? "Unknown";
  const gender = llm.persona.match(/"Gender": "(.*)"/)?.[1] ?? "Unknown";

  client.user
    ?.setUsername(personaName)
    .then((user) =>
      console.log(`Mon nouveau nom d'utilisateur est ${user.username}`)
    )
    .catch(console.error);

  client.user?.setActivity({
    name: `${personaName}`,
    type: ActivityType.Playing,
    state: `Country : ${country} | Age : ${age} | Gender : ${gender}`,
  });

  // client.user
  //   ?.setAvatar(
  //     "https://cours.tsix.be/storage/images/courses/poo-et-framework-copie-1/KPNt0furvtRETF9j7GHDfHkUQv66JqVVISIoy6lX.png"
  //   )
  //   .then((user) => console.log(`Avatar changé pour ${user.username}`))
  //   .catch(console.error);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.id === botId) {
    return;
  }

  if (llm.persona === "") {
    message.reply("Je ne suis pas encore prêt.e !");
    return;
  }

  if (message.content === "!hello") {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Bot connecté")
      .setDescription(`Je suis prêt ! Connecté en tant que ${botName}`)
      .addFields(
        { name: "Model", value: llm.llm.model },
        { name: "Personnalité", value: llm.persona }
      );

    message.channel.send({ embeds: [embed] });
    return;
  }

  try {
    // @ts-ignore - DiscordJS types are wrong
    const messages = await message.channel.messages.fetch({ limit: 10 });

    // decideAction
    const action = await llm.decideAction(messages);
    if (action === "none") {
      return;
    }

    // @ts-ignore - DiscordJS types are wrong
    message.channel.sendTyping();
    console.log("génération de la réponse");

    const reply = (await llm.chatWithPersona(messages)) ?? "No reply";
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

let token: string;

if (process.env.NODE_ENV === "production") {
  token = process.env.DISCORD_SECRET_PROD || "";
} else {
  token = process.env.DISCORD_SECRET_DEV || "";
}

client.login(token);
