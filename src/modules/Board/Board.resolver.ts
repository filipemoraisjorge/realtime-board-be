import {
    Arg,
    Mutation,
    Publisher,
    Query,
    Resolver,
    Root,
    Subscription,
    PubSub
} from "type-graphql";
import Point, {PointInput} from "../Point/Point";
import Board from "./Board";
import {User} from "../User/User";
import {UserService} from "../User/User.service";
import {Service} from "typedi";

@Service()
@Resolver()
export class BoardResolver {
    private boardsCollection: Map<string, Board> = new Map();

    constructor(
        private readonly userService: UserService,
    ) {}

    @Query(returns => Board, {nullable: true})
    getBoard(@Arg("boardId") boardId: string): Board | undefined {
        return this.boardsCollection.get(boardId);
    }

    @Query(returns => [Board])
    getBoards(): Board[] {
        return Array.from(this.boardsCollection.values())
    }

    @Query(returns => [User], {nullable: true})
    getBoardUsers(@Arg("boardId") boardId: string): User[] | undefined {
        const board = this.getBoard(boardId);
        if (board) {
            return board.users();
        } else {
            return;
        }
    }

    @Mutation()
    createBoard(
        @PubSub("BOARD") publish: Publisher<User[]>,
    ): Board {
        const board = new Board();
        this.boardsCollection.set(board.id, board);
        board.startBoardStream(publish);
        return board;
    }

    @Mutation(returns => Board, {nullable: true})
    updateUserPoint(
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
        @Arg("point") point: PointInput
    ): Board | undefined {
        const board = this.getBoard(boardId);
        board?.updateUserPoint(userId, point);
        return board;
    }

    @Mutation(returns => Boolean, {nullable: true})
    joinBoard(
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
    ): boolean {
        const board = this.getBoard(boardId);
        const user = this.userService.getOne(userId);
        return !!board && !!user && board.addUser(user);
    }

    @Mutation(returns => Boolean, {nullable: true})
    exitBoard(
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
    ): boolean {
        const board = this.getBoard(boardId);
        const user = this.userService.getOne(userId);
        return !!board && !!user && board.removeUser(user);
    }

    @Subscription(returns => [User], {topics: "BOARD"})
    newUserPoints(@Root() userPointsPayload: User[]): User[] {
        return userPointsPayload;
    }

}

