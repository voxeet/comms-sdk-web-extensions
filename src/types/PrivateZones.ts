import { SpatialPosition, SpatialScale, Vector } from '@voxeet/voxeet-web-sdk/types/models/SpatialAudio';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';

type SpatialDimension = Vector<number>;

/**
 * Model representing a zone.
 */
export type Zone = {
    /** Origin coordinates of the zone. */
    origin: SpatialPosition;
    /** The dimension of the zone. */
    dimension: SpatialDimension;
    /** The application's distance units or scale in application units per one meter. */
    scale: SpatialScale;
    /** Users' video is restricted in the boundaries of the zone. Default is false. */
    videoRestriction?: boolean;
};

export type Zones = Map<string, Zone>;

export type PrivateZones = {
    /**
     * Configures a spatial environment of an application, so the audio renderer understands which directions the application considers forward, up, and right and which units it uses for distance.
     *
     * This method is available only for participants who joined the conference with the [spatialAudio](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-joinoptions#spatialaudio) parameter enabled. Otherwise, SDK triggers [UnsupportedError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-unsupportederror).
     *
     * If not called, the SDK uses the default spatial environment, which consists of the following values:
     *
     * - `forward` = (0, 0, 1), where +Z axis is in front
     * - `up` = (0, 1, 0), where +Y axis is above
     * - `right` = (1, 0, 0), where +X axis is to the right
     * - `scale` = (1, 1, 1), where one unit on any axis is 1 meter
     *
     * If sending the updated positions to the server fails, the SDK generates the ConferenceService event error that includes [SpatialAudioError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-spatialaudioerror).
     *
     * @param scale - The application's distance units or scale in application units per one meter. The value must be greater than 0. Otherwise, SDK emits [ParameterError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-parametererror).
     * @param forward - A vector describing the direction the application considers as forward. The value must be orthogonal to up and right. Otherwise, SDK emits [ParameterError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-parametererror).
     * @param up - A vector describing the direction the application considers as up. Must be orthogonal to forward and right. Otherwise, SDK emits [ParameterError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-parametererror).
     * @param right - A vector describing the direction the application considers as right. Must be orthogonal to forward and up. Otherwise, SDK emits [ParameterError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-parametererror).
     */
    setSpatialEnvironment: (scale: SpatialScale, forward: SpatialPosition, up: SpatialPosition, right: SpatialPosition) => void;

    /**
     * Creates a private audio zone.
     * @param zone private zone to create.
     * @returns the unique identifier for this newly created private zone.
     */
    createZone: (zone: Zone) => Promise<string>;

    /**
     * Gets the list of private zones.
     * @returns a dictionary of private zones.
     */
    zones: Zones;

    /**
     * Deletes a private zone.
     * @param id identifier of the private zone to delete.
     */
    deleteZone: (zoneId: string) => Promise<void>;

    /**
     * Updates a private zone.
     * @param id identifier of the private zone to update.
     * @param zone new settings for the private zone.
     */
    updateZone: (zoneId: string, zone: Zone) => Promise<void>;

    /**
     * Sets a participant's position in space to enable the spatial audio experience during a Dolby Voice conference. This method is available only for participants who joined the conference with the [spatialAudio](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-joinoptions#spatialaudio) parameter enabled. Otherwise, SDK triggers [UnsupportedError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-unsupportederror). Depending on the specified participant in the `participant` parameter, the setSpatialPosition method impacts the location from which audio is heard or from which audio is rendered:
     *
     * - When the specified participant is the local participant, setSpatialPosition sets a location from which the local participant listens to a conference. If the local participant does not have an established location, the participant hears audio from the default location (0, 0, 0).
     *
     * - When the specified participant is a remote participant, setSpatialPosition ensures the remote participant's audio is rendered from the specified position in space. If the remote participant does not have an established location, the participant does not have a default position and will remain muted until a position is specified.
     *
     * For example, if a local participant Eric, who does not have a set direction, calls setSpatialPosition(VoxeetSDK.session.participant, {x:3,y:0,z:0}), Eric hears audio from the position (3,0,0). If Eric also calls setSpatialPosition(Sophia, {x:7,y:1,z:2}), he hears Sophia from the position (7,1,2). In this case, Eric hears Sophia 4 meters to the right, 1 meter above, and 2 meters in front.
     *
     * If sending the updated positions to the server fails, the SDK generates the ConferenceService event error that includes [SpatialAudioError](https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-spatialaudioerror).
     *
     * @param participant - The selected participant. Using the local participant sets the location from which the participant will hear a conference. Using a remote participant sets the position from which the participant's audio will be rendered.
     * @param position - The participants' audio location.
     */
    setSpatialPosition: (participant: Participant, position: NonNullable<SpatialPosition>) => Promise<void>;
};

export type CreatePrivateZones = () => PrivateZones;
