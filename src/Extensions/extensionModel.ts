interface Iextension<T> {
    name: string;
    register(newValue: T): void
    get(id: string): T 
    list(visitor: (item: T)=> void): void;
}
export interface ExtensionModel<T> extends Record<string, any> {
    name: string;
    commands: Record<string, T>
}