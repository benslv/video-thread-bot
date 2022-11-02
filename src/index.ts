import dotenv from "dotenv";
dotenv.config();

import { Client, Intents } from "discord.js";
import type { Message } from "discord.js";
import fetch from "node-fetch";
import { TextChannel } from "discord.js";

import validUrls from "./urls";

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});
try {
  client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;

    if (message.channelId !== process.env.VID_CHANNEL_ID) return;

    const urls = matchUrls(message.content);
    var hasVideo = false;
    if (message.attachments.size > 0){
      message.attachments.forEach(function func(value, key, map){
        if (value.url.endsWith("mov") || value.url.endsWith("mp4") || value.url.endsWith("webm")){
          hasVideo = true;
        }
      })
    }

    if (urls.length > 0 && isValidUrl(urls[0])) { 
      const title = await getUrlTitle(urls[0]);

      message.startThread({
        name: title || `New TAS by ${message.author.tag}`,
        autoArchiveDuration: 1440, // one day
        reason: `New TAS by ${message.author.tag}`,
      });
      console.log(`Created thread for ${message.content}`);
    }

    if (hasVideo){
      message.startThread({
        name: `New TAS by ${message.author.tag}`,
        autoArchiveDuration: 1440, // one day
        reason: `New TAS by ${message.author.tag}`,
      });
      console.log(`Created thread for video by ${message.author.tag}`);
    }

  })
} catch (error) {
  if (error instanceof Error){
    console.log(error.message); //log message locally
    ( client.channels.cache.get('825266321327521793') as TextChannel ).send(error.message); //send on private discord
  }
}

// Match all URLs present in the message.
function matchUrls(content: string) {
  const matches = content.match(/(((https?:\/\/)|(www\.))[^\s]+)/g);

  return matches || [];
}

// Determine if the URL posted is present in the allow list.
function isValidUrl(messageUrl: string): boolean {
  const url = new URL(messageUrl);
  const hostname = url.hostname;

  return validUrls.has(hostname);
}

// Fetch the HTML content of the video page to determine the title.
async function getUrlTitle(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();

  const title = html.match(/<title>(.*)<\/title>/i);

  if (title) {
    // returns the title without html tags around it
    // and truncates its max length to 100 (max thread title allowed)
    return truncateString(title[1], 100); 
  }

  return "";
}

function truncateString(string: string, length: number) {
  if (string.length <= length) return string;

  return string.slice(0, length - 3) + "...";
}

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
