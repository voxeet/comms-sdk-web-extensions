import { SpatialAudio } from './SpatialAudio';
import { Conferencing } from './Conference';

export type Extension = {
    /**
     * Retrieves the Conference instance that allows to access helpers for the conference.
     */
    conference: Conferencing;

    /**
     * Retrieves the SpatialAudio instance that allows to manipulate the spatial audio scene.
     */
    spatialAudio: SpatialAudio;
};

export type CreateExtension = () => Extension;
