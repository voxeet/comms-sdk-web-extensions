import { CreateExtension } from './types/SDKExtension';
import createBreakout from './breakout';
import createConferencing from './conference';
import Commands from './commands';
import createPrivateZones from './privateZones';

const createSDKExtension: CreateExtension = () => {
    const commands = new Commands();

    return {
        breakout: createBreakout(commands),
        conference: createConferencing(),
        commands: commands,
        privateZones: createPrivateZones(),
    };
};

const extension = createSDKExtension();
export default extension;
