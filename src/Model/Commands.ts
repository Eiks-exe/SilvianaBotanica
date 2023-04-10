import IdObject from "src/Interfaces/IdObject";

export type  CommandType = "slash" | "message"

export default class Command implements IdObject {
    public  id : string;
    public description: string
    public types:  Array<CommandType>;
    public method: Function;
    constructor(
        id:string,
        description: string,
        types: Array<CommandType>,
        method: Function
    ){
        this.id = id;
        this.description= description;
        this.types= types
        this.method = method
    }
}