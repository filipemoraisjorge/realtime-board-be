import {ArgsType, Field, ID, ObjectType, registerEnumType} from "type-graphql";
import {UUID} from "../Types/uuid.type";
import {User} from "../User/User";
import Board from "./Board";

@ArgsType()
export class UserBoardConnectArgs {
    @Field(type => ID)
    boardId!: UUID;
    @Field(type => ID)
    userId!: UUID;
    @Field(type => UserBoardConnectE)
    connect!: UserBoardConnectE
}

@ObjectType()
export class UserBoardPayload {
    @Field(type => ID)
    board!: Board;
    @Field()
    user!: User;
    @Field(type => UserBoardConnectE)
    connect!: UserBoardConnectE;
}

export enum UserBoardConnectE {
    JOIN = 'JOIN',
    EXIT = 'EXIT'
}

registerEnumType(UserBoardConnectE, {name: "UserBoardConnectE"});
