import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Player } from 'lavaclient';

export default class JoinCommand extends BaseCommand {
  constructor() {
    super(
      'join',
      'Music',
      ['connect'],
      'Joins your voice channel if the bot is able to join it.',
      '',
      false,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const { channel } = message.member.voice;
    let player: Player = client.music.players.get(message.guild.id);

    if (player && !message.guild.me.voice.channel) {
      await client.music.destroy(message.guild.id);
    }
    if (player && message.guild.me.voice.channel)
      return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | I am already in a voice Channel.`);
    if (!channel) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | You are not in a voice channel!`);

    player = await client.music.create(message.guild.id);
    await player.connect(channel.id, { selfDeaf: true });

    return message.channel.send(`> 🎧 | Connected to \`${channel.name}\`!`);
  }
}