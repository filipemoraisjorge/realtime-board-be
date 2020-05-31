import {v4 as uuidV4} from 'uuid';

export type UUID = string;

export function newUUID() {
    return uuidV4();
}
