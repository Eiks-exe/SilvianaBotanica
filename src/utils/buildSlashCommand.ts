import { ApplicationCommandOptionType, SlashCommandBuilder } from "discord.js";
import { ICommand } from "src/Interfaces/commands";

export const buildSlashCommand = (command: ICommand) => {
  const builder = new SlashCommandBuilder()
    .setName(command.id)
    .setDescription(command.description)
  
  if (command.options) {
    command.options.forEach(option =>{
      switch (option.type) {
        case ApplicationCommandOptionType.User:
          builder.addUserOption(o =>
            o.setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          )
          break;

        case ApplicationCommandOptionType.String:
          builder.addStringOption(o => 
            o.setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          )
          break;
        case  ApplicationCommandOptionType.Integer:
          builder.addIntegerOption(o=>
            o.setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          )
          break
        case ApplicationCommandOptionType.Mentionable:
          builder.addMentionableOption(o=>
            o.setName(option.name)
              .setDescription(option.description)
              .setRequired(option.required ?? false)
          )
          break
        case ApplicationCommandOptionType.Subcommand:
        case ApplicationCommandOptionType.SubcommandGroup:
        case ApplicationCommandOptionType.Boolean:
        case ApplicationCommandOptionType.Channel:
        case ApplicationCommandOptionType.Role:
        case ApplicationCommandOptionType.Number:
        case ApplicationCommandOptionType.Attachment:
      }
    
    })
  }
  return builder;
}
