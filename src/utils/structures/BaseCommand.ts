
import { Message } from 'discord.js';
import DiscordClient from '../../client/client';

export default abstract class BaseCommand {
  constructor(
    private name: string, 
    private category: string, 
    private aliases: Array<string>,
    private description: string, 
    private usage: string,  
    private ownerOnly: boolean, 
    private djRole: boolean
    ) {}

  getName(): string { return this.name; }
  getCategory(): string { return this.category; }
  getAliases(): Array<string> { return this.aliases; }
  getDescription(): string { return this.description; }
  getUsage(): string { return this.usage; }
  getOwnerOnly(): boolean { return this.ownerOnly; }
  getDjRole(): boolean { return this.djRole; }

  abstract async run(client: DiscordClient, message: Message, args: Array<string> | null): Promise<Message>;
}