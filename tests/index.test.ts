import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import VoxeetSDKExt from '../src/index';

describe('index test suite', () => {
    test('index should match the snapshot', () => {
        expect(VoxeetSDKExt).toMatchSnapshot();
    });
});
