import { config } from 'dotenv';
config();
import { registerCommands, registerEvents, registerWSEvents, registerMusicEvents } from './utils/registry';
import { EmojiFinder } from './utils/functions/emojiFinder'
import { Manager } from 'lavaclient';
import Queue from './utils/functions/queue';
import DiscordClient from './client/client';
const client = new DiscordClient({});

(async () => {
  client.prefix = process.env.DISCORD_BOT_PREFIX || client.prefix;
  client.music = new Manager([{
    id: "main",
    host: "localhost",
    port: 7621,
    password: process.env.PASSWORD,
  }], {
    shards: client.shard ? client.shard.count : 1,
    send(id, pk) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(pk);
    },
  });
  client.emojiFinder = EmojiFinder;
  
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events/ClientEvents');
  await registerWSEvents(client, '../events/WebSocketEvents');
  await registerMusicEvents(client, client.music, '../events/musicEvents');
  await client.login(process.env.DISCORD_BOT_TOKEN);
})();

declare module "lavaclient" {
  interface Player {
    queue: Queue;
    send(op: string, body?: any): Promise<void>;
    _connected: boolean;
    bass: "hard" | "medium" | "low" | "none";
    repeating: "song" | "queue" | "always" | "nothing";
    filter: "nightcore" | "slowed" | "default" | "soft" | "trebblebass";
  }
}

declare module 'discord.js' {
  interface Client {
    emojiFinder: typeof EmojiFinder;
  }
}

