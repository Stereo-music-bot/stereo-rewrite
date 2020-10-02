import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { MessageEmbed } from 'discord.js';
import rest from '../../utils/functions/rest';
import Util from '../../utils/functions/util';

import { decode } from "@lavalink/encoding";

interface TrackInfo {
  flags?: number;
  source: string;
  identifier: string;
  author: string;
  length: bigint;
  isStream: boolean;
  position: bigint;
  title: string;
  uri: string | null;
  version?: number;
  probeInfo?: { raw: string, name: string, parameters: string | null };
}

export default class QueueCommand extends BaseCommand {
  constructor() {
    super(
      'queue', 
      'Music', 
      ['q'],
      'Shows you the current playing song and the upcoming songs',
      '',
      false,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.channel.send(
      `> ${client.emojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );
    const items = player.queue.next.map((data, index) => {
      const res: TrackInfo = decode(data.track);
      return {
        title:
          res.title.length > 20
            ? res.title.substring(0, 40)
            : res.title,
        uri: res.uri,
        length: res.length,
        index,
      };
    });

    const map = items.slice(0, 10).map((d) => `**${( d.index) + 1}**. [${d.title}](${d.uri}) - \`${Util.formatTime(Number(d.length))}\``);
    
    const embed = new MessageEmbed()
      .setTitle(`Music queue for ${message.guild.name}`)
      .addField(`Now Playing | Requested by ${message.guild.members.cache.get(player.queue.current.requester).user.tag}`, [
        `> 🎵 | [${(await rest.decode(player.queue.current.track)).title}](${(await rest.decode(player.queue.current.track)).uri}) - \`${Util.formatTime(Number((await rest.decode(player.queue.current.track)).length))}\``,
        `> 👤 | ${message.guild.members.cache.get(player.queue.current.requester).toString()}`
      ])
      .addField(`Queued Songs | ${map.length} of ${items.length} song(s) shown`, map)
      .setColor(message.guild.members.cache.get(player.queue.current.requester).displayHexColor || 'BLUE')
      .setThumbnail(`https://i.ytimg.com/vi/${(decode(player.queue.current.track)).identifier}/hqdefault.jpg`)
    return message.channel.send(embed);
  }
}