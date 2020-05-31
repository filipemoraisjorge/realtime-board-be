import {User} from "../User/User";

export default interface Serviceable<T> {
    get: (id: string) =>  T;
    set: (item: T) => void;
    remove: (item: T) => boolean;
    getAll: () => T[];
}
