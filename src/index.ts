import {
  Message,
  Client,
  Events,
  IntentsBitField,
  EmbedBuilder,
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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c: Client) => {
  console.log(`Ready! Logged in as ${c.user?.tag}`);
  botName = c.user?.tag || "Bot";
  console.log("génération des personnalités");
  await llm.generatePersonas();
  console.log("personnalités générées");
  console.log("Persona sélectionné :");
  console.log(llm.persona);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.tag === botName) {
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
