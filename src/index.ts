import dotenv from "dotenv";
dotenv.config();

import { Client, Intents } from "discord.js";
import type { Message } from "discord.js";
import fetch from "node-fetch";
import htmlparser2 from "htmlparser2";

import validUrls from "./urls";

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  if (message.channelId !== process.env.VID_CHANNEL_ID) return;

  if (validUrl(message.content)) {
    console.log("Valid message!");

    const title = await getUrlTitle(message.content);

    console.log(title);
  } else {
    message.delete();
  }
});

function validUrl(messageUrl: string): boolean {
  try {
    const url = new URL(messageUrl);
    const hostname = url.hostname;

    return validUrls.has(hostname);
  } catch (e) {
    return false;
  }
}

async function getUrlTitle(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();

  const title = html.match(/<title>(.*)<\/title>/i);

  if (title) {
    return title[1]; // returns the title without html tags around it
  }

  return "New TAS video!";
}

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
