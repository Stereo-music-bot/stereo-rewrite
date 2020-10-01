import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ForceskipCommand extends BaseCommand {
  constructor() {
    super(
      'forceskip', 
      'Music', 
      ['fs', 'fnext'],
      false,
      true
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    if (!player) return message.channel.send(
      `> ${client.emojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);

    await player.queue.skip(player);
    if (player.queue.current) return message.channel.send(`> ⏭ | Successfully skipped the song!`);
  }
}