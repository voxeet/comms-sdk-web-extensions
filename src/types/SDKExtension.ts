import { Breakout } from './Breakout';
import { Conferencing } from './Conference';
import { CommandsType } from './Commands';
import { SpatialAudio } from './SpatialAudio';

export type Extension = {
    /**
     * Retrieves the Breakout instance that allows to access helpers for the breakout rooms.
     */
    breakout: Breakout;

    /**
     * Retrieves the Conference instance that allows to access helpers for the conference.
     */
    conference: Conferencing;

    /**
     * Retrieves the Commands instance that allows to access helpers for the commands.
     */
    commands: CommandsType;

    /**
     * Retrieves the SpatialAudio instance that allows to manipulate the spatial audio scene.
     */
    spatialAudio: SpatialAudio;
};

export type CreateExtension = () => Extension;
