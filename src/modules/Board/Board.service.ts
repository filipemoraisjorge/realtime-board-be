import {Service, Inject} from "typedi";
import Serviceable from "../Types/service.interface";
import Board from "./Board";

@Service()
export class BoardService implements Serviceable<Board> {
    @Inject("BOARDS")
    private readonly items: Map<string, Board> = new Map();

    getAll(): Board[] {
        return Array.from(this.items.values());
    }

    get(id: string): Board {
        const board = this.items.get(id);
        if (board === undefined) {
            throw 'Board.service>get: Board not found'
        }
        return board;
    }

    set(board: Board): void {
        this.items.set(board.id, board);
    }

    remove(board: Board): boolean {
        return this.items.delete(board.id);
    }
}
