import { ICommand } from '../Interfaces/commands';

export interface IExtension<T> {
    name: string;
    description: string;
    version: string;
    commands: Map<string, T>;

    init: () => void;
    register: (id:string, command: T) => void;
    get: (id:string) => T;
    list: () => Map<string, T>;
}


export class ExtensionModel<T> implements IExtension<T> {
    readonly name: string;
    readonly description: string;
    readonly version: string;
    commands: Map<string, T>;
    init : () => void;  
    constructor(name: string, description: string, version: string) {
        this.name = name;
        this.description = description;
        this.version = version;
        this.commands = new Map<string, T>();
        this.init = () => {};
    }
    

    register = (id:string, command: T) => {
        this.commands.set(id, command);
    }

    unregister = (id:string) => {   
        this.commands.has(id) ? this.commands.delete(id) : console.error(`Command ${id} not found`);
    }

    get = (id:string) : T => {
        if (!this.commands.has(id)) throw new Error(`Command ${id} not found`);
        return this.commands.get(id) as T;
    }

    list = () => {
        return this.commands;
    }

    
}
