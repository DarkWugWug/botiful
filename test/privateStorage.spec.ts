import { PrivateStorage } from '..';
import persist from 'node-persist';

describe('Public Storage Interface', () => {
    beforeAll(async () => {
        await persist.init({ dir: './data/'});
    })

    describe('Simple Gets', () => {
        it('should return the expected value', () => {

        })
    })
})
