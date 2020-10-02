import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { MessageEmbed } from 'discord.js';
import createBar from 'string-progressbar';
import Util from '../../utils/functions/util';
import rest from '../../utils/functions/rest';
import { decode } from '@lavalink/encoding';

const repeats = {
  queue: `**🔁 | Repeat**: \`Queue\``,
  song: `**🔂 | Repeat**: \`Song\``,
  none: `**▶ | Repeat**: \`None\``
}

export default class NowplayingCommand extends BaseCommand {
  constructor() {
    super(
      'nowplaying', 
      'Music', 
      ['np'],
      'Shows you the info about the current playing song',
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
    
    let current;
    try {
      current = decode(player.queue.current.track);
    } catch (e) {
      try {
        current = await rest.decode(player.queue.current.track);
      } catch (e) {
        return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | An unexpected error occured, I can unfortunatley not show you the playing information.`);
      }
    }

    const requester = message.guild.members.cache.get(player.queue.current.requester);

    const embed = new MessageEmbed()
    .setAuthor(`Now playing: ${current.title}`, player.playing ? 'https://emoji.gg/assets/emoji/6935_Plak_Emoji.gif' : 'https://imgur.com/Y9XRC6N.png')
    .setDescription([
      `> **🎵 | Song**: [${current.title}](${current.uri})`,
      `> **👤 | Requested by**: ${requester.toString()}`,
      `> ${(player.queue.repeat.always || player.queue.repeat.queue) ? repeats['queue'] : player.queue.repeat.song ? repeats['song'] : repeats['none']}`,
      `> **🔊 | Volume**: \`${player.volume / 100}\` \n`,
      `> **↔️ | Play Progress**: \`${(Util.formatTime(player.position).length === 2 ? `00:` + Util.formatTime(player.position) : Util.formatTime(player.position)) || '00:00'}\` / \`${Util.formatTime(Number(current.length))}\``,
      `> ⌚ **|** [${"▬".repeat(Math.floor((player.position / Number(current.length)) * 20)) + "⚪" + "-".repeat(20 - Math.floor((player.position / Number(current.length)) * 20))}]`
    ])
    .setThumbnail(`https://i.ytimg.com/vi/${current.identifier}/hqdefault.jpg`)
    .setColor(requester.displayHexColor || 'BLUE')
    return message.channel.send(embed);
  }
}