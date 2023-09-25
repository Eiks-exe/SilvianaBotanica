import { CommandType } from "../Model/Commands"

export interface ICommand {
    id: string
    description: string
    method: Function
    types: CommandType[]
    options?: []
}
