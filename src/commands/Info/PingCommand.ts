import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import formatTime from 'humanize-duration'

export default class PingCommand extends BaseCommand {
  constructor() {
    super(
      'ping', 
      'Info', 
      ['pong'],
      'Pings the bot and shows you the reaction time',
      '',
      false,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    return message.channel.send(`> 🏓 | Pinging...`).then(m => {
      const editLatency = (m.createdTimestamp - Date.now()).toString()
      const edit = editLatency.startsWith('-')
      ? editLatency.slice(1)
      : editLatency;
      return m.edit(`> 🏓 | pong! Edit Latency: \`${edit}\` ms, API Latency: \`${client.ws.ping}\` ms. Uptime: \`${formatTime(client.uptime, { round: true })}\``);
    })
  }
}