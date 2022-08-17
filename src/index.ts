import { CreateExtension } from './types/SDKExtension';
import createSpatialAudio from './spatialAudio';
import createConferencing from './conference';

const createSDKExtension: CreateExtension = () => {
    return {
        conference: createConferencing(),
        spatialAudio: createSpatialAudio(),
    };
};

const extension = createSDKExtension();
export default extension;
