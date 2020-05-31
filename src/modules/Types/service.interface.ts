import {UUID} from "./uuid.type";

export default interface Serviceable<T> {
    get: (id: UUID) =>  T;
    set: (item: T) => void;
    remove: (item: T) => boolean;
    getAll: () => T[];
}
