import { ApplicationCommandOptionType } from "discord.js"
type CommandType = "CHAT" | "SLASH" | "MESSAGE" | "REACTION" | "INTERACTION"

type optionType = "SUB_COMMAND" | "SUB_COMMAND_GROUP" | "STRING" | "INTEGER" | "BOOLEAN" | "USER" | "CHANNEL" | "ROLE" | "MENTIONABLE" | "NUMBER"
/**
 * The command interface.
 */
export interface ICommand {
    id: string
    description: string
    types: CommandType[]
    method: Function
    options?: commandOption[]
}

export interface commandOption {
    name: string
    description: string
    type: ApplicationCommandOptionType
    required?: boolean
    choices?: []
    options?: []
}
