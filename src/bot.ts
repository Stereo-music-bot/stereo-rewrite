import { config } from 'dotenv';
config();
import { registerCommands, registerEvents, registerWSEvents, registerMusicEvents } from './utils/registry';
import { EmojiFinder } from './utils/functions/emojiFinder'
import { Manager } from 'lavaclient';
import Queue from './utils/functions/queue';
import DiscordClient from './client/client';
import { WebhookClient } from 'discord.js';
const client = new DiscordClient({});

(async () => {
  const webhook = new WebhookClient('762318210959540234', 'qX0BfjL9GVopsV6zq1OXXEkeEvGC_3u9tHLUYTgCkWMZlsZE3azVJYNVsx1K5-8Vd12h');

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
  client.owners = ['304986851310043136'];
  client.Webhook = webhook;
  client.Webhook.edit({ name: 'Stereo Backlog', avatar: 'https://cdn.discordapp.com/attachments/745370558149165197/761613083398373428/Stereo_Logo-halloween1.png'});

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
    owners: Array<string>;
    Webhook: WebhookClient;
  }
}

