import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class SkiptoCommand extends BaseCommand {
  constructor() {
    super(
      'skipto', 
      'Music', 
      [],
      'Skips the amount of songs you want',
      '<song number>',
      false,
      true
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    if (!args[0]) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | No song number provided.`);
    if (!player || !player.queue.next[0]) return message.channel.send(
      `> ${client.emojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    if (parseInt(args[0]) > player.queue.next.length || isNaN(parseInt(args[0])))
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | Invalid song number.`);
    await player.queue.skipto(parseInt(args[0]) - 1);
    if (player.queue.current) return message.channel.send(`> ⏭ | Successfully skipped \`${args[0]}\` song(s)!`);
  }
}