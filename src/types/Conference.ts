import Conference from '@voxeet/voxeet-web-sdk/types/models/Conference';
import { JoinOptions, ListenOptions } from '@voxeet/voxeet-web-sdk/types/models/Options';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';

export type AttachMediaStreamToHTMLVideoElement = (participant: Participant) => HTMLVideoElement;

export type Conferencing = {
    /**
     * Gets an HTML video element for the specified participant.
     * @param participant Participant to display the stream from.
     * @returns an `HTMLVideoElement` element.
     */
    attachMediaStreamToHTMLVideoElement: AttachMediaStreamToHTMLVideoElement;

    /**
     * Rejoins the conference as a USER.
     * @param options - The additional options for the joining participant.
     * @returns the `Conference` object that represents the conference that was joined.
     */
    switchToUser: (options: JoinOptions) => Promise<Conference>;

    /**
     * Rejoins the conference as a LISTENER.
     * @param options - The additional options for the joining participant.
     * @returns the `Conference` object that represents the conference that was joined.
     */
    switchToListener: (options?: ListenOptions) => Promise<Conference>;
};

export type CreateConferencing = () => Conferencing;
