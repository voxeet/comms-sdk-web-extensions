import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';

import { CommandsType } from './Commands';

/**
 * Model representing a breakout room.
 */
export type BreakoutRoom = {
    name: string;
    participants: Participant[];
};

export type BreakoutRoomCommandPayload = {
    name: string;
    participants: string[];
};

export type BreakoutRooms = Map<string, BreakoutRoom>;

export type Breakout = {
    /**
     * Gets the list of breakout rooms.
     * @returns a dictionary of breakout rooms.
     */
    breakoutRooms: BreakoutRooms;

    /**
     * Creates a new breakout room.
     * @param room - Breakout room to create.
     * @returns the unique identifier for this newly created breakout room.
     */
    createRoom: (room: BreakoutRoom) => Promise<string>;

    /**
     * Closes a breakout room and move all participants to the main room.
     * @param id - Identifier of the breakout room to close.
     */
    closeRoom: (id: string) => Promise<void>;

    /**
     * Moves a list of participants into a breakout room.
     * @param roomId - Identifier of the breakout room to move the participants to.
     *                 If this value is `null` then the participants will be moved to the main room.
     * @param participants - List of participants to move.
     */
    moveTo: (roomId: string | null, participants: Participant[]) => Promise<void>;
};

export type CreateBreakout = (commands: CommandsType) => Breakout;
