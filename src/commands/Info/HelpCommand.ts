import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import FuzzySearch from 'fuzzy-search';


const inviteLink = 'https://discord.com/oauth2/authorize?client_id=745665203777306664&&scope=bot&permissions=11947336&response_type=code&redirect_uri=https%3A%2F%2Fofficialstereodisc.wixsite.com%2Fhome';
const supportServer = 'https://discord.gg/bvn89qP';
const website = 'https://officialstereodisc.wixsite.com/home';

export default class HelpCommand extends BaseCommand {
  constructor() {
    super(
      'help', 
      'Info', 
      [],
      'uhm, do you want to know about this?',
      '[command name or alias]',
      false,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    //if (client.user.username === 'Stereo Dev' && !client.owners.includes(message.author.id)) return message.channel.send(`> 🎵 | I'm looking for my owner, can you help me searching?`)
    const prefix = client.prefix;
    let embed = new MessageEmbed()
      .setTitle(`${message.guild.name}'s help menu`)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }) || client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor(message.member.displayHexColor || 'BLUE')
    
    client.owners.includes(message.author.id) ? embed.addField(`Bot Commands - [${client.cs.size}]`, `> ❓ | \`<>\` means this part of the command is needed | \`[]\` means that this part of the command is optional and not needed`) :
      embed.addField(`Bot Commands - [${client.cs.size - client.cs.filter(c => !c.getOwnerOnly()).size}]`, `> ❓ | \`<>\` means this part of the command is needed | \`[]\` means that this part of the command is optional and not needed`)
    
    if (args[0]) {
      const cmd = client.commands.get(args[0]);
      if (!cmd) {
        const result = noResult(client.cs.array(), args[0]);
        return message.channel.send(
          `> ${client.emojiFinder(client, 'redtick').toString()} | No command was found for you query. ${result.length ? 'Did you mean to search for: ' + result.map(c => `\`${c.getName()}\``).join(', ') + '?' : ''}`
        )
      };

      embed.setDescription([
        `> 🏷 | **Name**: \`${cmd.getName()}\``,
        `> 📂 | **Category**: \`${cmd.getCategory()}\``,
        `> 📄 | **Alliases**: ${cmd.getAliases().length ? cmd.getAliases().map(alias => `\`${alias}\``).join(' ') : 'No aliases'} \n`,
        `> 📖 | **description**: ${cmd.getDescription() || 'No description given.'}`,
        `> 📋 | **usage**: ${cmd.getName()} ${cmd.getUsage() || ''} \n`,
        `> ${cmd.getOwnerOnly() ? '🔒' : '🔓'} | **Owner Only**: \`${cmd.getOwnerOnly() || 'false'}\``,
        `> 👮‍♂️ | **Djrole**: \`${cmd.getDjRole() || 'false'}\``
      ]);
      embed.addField(`\u200b`, `[Invite me](${inviteLink}) | [Support Server](${supportServer}) | [Website](${website})`)
      return message.channel.send(embed);
    } else {
      let categories;
      if (!client.owners.includes(message.author.id)) {
        categories = removeDuplicates(client.cs.filter(cmd => !cmd.getOwnerOnly()).map(cmd => cmd.getCategory()));
      } else {
        categories = removeDuplicates(client.cs.map(cmd => cmd.getCategory()));
      }

      for (const category of categories) {
        embed.addField(`**${category}**`, client.cs.filter(cmd => cmd.getCategory() === category).map(cmd => `\`${cmd.getName()}\``).join(' '), true);
      }
      embed.setDescription(`> 🤖 | The prefix for this server is \`${prefix}\`, \n \n > 💬 | Use \`${prefix}help <command name>\` to get more info about a specific command!`);
      embed.addField(`\u200b`, `[Invite me](${inviteLink}) | [Support Server](${supportServer}) | [Website](${website})`)
      return message.channel.send(embed)
    }
  }
}

function removeDuplicates(arr: Array<string>): Array<string> {
  return [...new Set(arr)];
}

function noResult(commands: Array<BaseCommand>, input: string) {
  const searcher = new FuzzySearch(commands, ['name', 'aliases'], {
    caseSensitive: true,
  });
  return searcher.search(input);
}