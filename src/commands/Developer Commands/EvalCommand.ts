import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import fetch from 'node-superfetch';
import { MessageEmbed } from 'discord.js';

export default class EvalCommand extends BaseCommand {
  constructor() {
    super(
      'eval', 
      'Developer Commands', 
      ['e', 'evaluate'],
      'How did you find this?!',
      '<code>',
      true,
      false
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const embed = new MessageEmbed()
      .addField("📥 Input", "```js\n" + args.join(" ") + "```");
    
    try {
      const code = args.join(" ");
      if (!code) return message.channel.send(`> ${client.emojiFinder(client, 'redtick').toString()} | No code provided!`);
      let evaled;
      
      if (code.includes(`KEY`) || code.includes(`SECRET`) || code.includes(`TOKEN`) || code.includes(`PORT`) || code.includes(`HOST`) || code.includes(`PASSWORD`)) evaled = "I am not allowed to share the music notes with anyone 🎵";
      else evaled = eval(code);
      
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled, {depth: 0});
      
      let output = clean(evaled);
      if (output.length > 1024) {
        const { body } = await fetch.post("https://hastebin.com/documents").send(output);
        embed.addField("📄 Output", `https://hastebin.com/${body.toString()}.js`).setColor(0x7289DA);
      } else embed.addField("📄 Output", "```js\n" + output + "```").setColor(0x7289DA)
      message.channel.send(embed);
    } catch (error) {
      let err = clean(error);
      if (err.length > 1024) {
        const { body } = await fetch.post("https://hastebin.com/documents").send(err);
        embed.addField("⚠️ Output", `https://hastebin.com/${body}.js`).setColor("RED");
      } else {
        embed.addField("⚠️ Output", "```js\n" + err + "```").setColor("RED");
      }
      
      return message.channel.send(embed);
    }
  }
}

function clean(string: string) {
  if (typeof Text === 'string') {
    return string.replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203))
  } else {
    return string;
  }
}