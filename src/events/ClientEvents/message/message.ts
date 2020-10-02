import BaseEvent from '../../../utils/structures/BaseEvent';
import { Message } from 'discord.js';
import DiscordClient from '../../../client/client';

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    //if (!client.owners.includes(message.author.id)) return;

    if (message.content.startsWith('-')) {
        if (!client.owners.includes(message.author.id)) {
          try {
            return message.delete();
          } catch (e) { }
        }
        const [cmdName, ...cmdArgs] = message.content
          .slice(client.prefix.length)
          .trim()
          .split(/\s+/);
        
      const valids = client.commands.filter(c => c.getCategory() === 'Owner' || c.getCategory() === 'Developer' || c.getCategory() === 'Staff');
      const command = valids.get(cmdName);
      if (command) command.run(client, message, cmdArgs);
      else if (!command) return message.channel.send(
        `> ${client.emojiFinder(client, 'redtick').toString()} | It looks like that is not a valid staff command, for normal commands use \`${client.prefix}\``
      );
    }
    if (message.content.startsWith(client.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
}