import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class VolumeCommand extends BaseCommand {
  constructor() {
    super(
      'volume', 
      'Audio Settings', 
      ['vol'],
      'Changes the volume of the player',
      '<volume>',
      false,
      true
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    const volume = parseInt(args[0]);

    if (!volume || isNaN(volume) || volume > 1000 || volume < 0) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | invalid volume amount provided.`);
    if (!player || !player.queue.current) return message.channel.send(
      `> ${client.emojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.setVolume(volume);
    return message.channel.send(`> 🔊 | Changed the volume to \`${volume}\`%`);
  }
}