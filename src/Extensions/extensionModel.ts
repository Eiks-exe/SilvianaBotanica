export interface Command {
    id: string
    method: Function
    description: string
}

interface Iextension<T> {
    name: string;
    register(newValue: T): void
    get(id: string): T 
    list(visitor: (item: T)=> void): void;
}

type IdObject = {
    id: string
} 


export class ExtentionModel<T extends IdObject> implements Iextension<T> {
    private commands: Record<string, T> = {};
    public name: string
    constructor(name: string){
        this.name = name
    }
    register(newValue: T): void {
        this.commands[newValue.id] = newValue;
    }
    get(id: string): T {
        return this.commands[id]
    }
    list(visitor: (item: T) => void): void {
        Object.values(this.commands).forEach(visitor);
    }
}