import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ShuffleCommand extends BaseCommand {
  constructor() {
    super(
      'shuffle', 
      'Music', 
      ['random'],
      'Shuffles the queue to give more play fun',
      '',
      false,
      true
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!player || !player.queue.next[0]) return message.channel.send(
      `> ${client.emojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    player.queue.shuffle();
    return message.channel.send(`> 🔀 | Successfully shuffled the queue!`);
  }
}