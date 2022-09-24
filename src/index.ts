import { CreateExtension } from './types/SDKExtension';
import createBreakout from './breakout';
import createConferencing from './conference';
import Commands from './commands';
import createSpatialAudio from './spatialAudio';

const createSDKExtension: CreateExtension = () => {
    const commands = new Commands();

    return {
        breakout: createBreakout(commands),
        conference: createConferencing(),
        commands: commands,
        spatialAudio: createSpatialAudio(),
    };
};

const extension = createSDKExtension();
export default extension;
