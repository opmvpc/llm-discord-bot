import { Message, Client, Events, IntentsBitField } from "discord.js";
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
client.once(Events.ClientReady, (c: Client) => {
  console.log(`Ready! Logged in as ${c.user?.tag}`);
  botName = c.user?.tag || "Bot";
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.tag === botName) {
    return;
  }

  try {
    // @ts-ignore - DiscordJS types are wrong
    const messages = await message.channel.messages.fetch({ limit: 10 });
    // @ts-ignore - DiscordJS types are wrong
    message.channel.sendTyping();
    console.log("génération de la réponse");

    const reply = (await llm.ask(messages, botName)) ?? "No reply";
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
