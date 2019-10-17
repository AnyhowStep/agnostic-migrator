import {StateStorage} from "../state-storage";
import {CannotUnlockError, ErrorCode} from "../migration-error";

/**
 * This should not throw an error
 */
export async function tryUnlock (stateStorage : StateStorage) : Promise<undefined|CannotUnlockError> {
    try {
        await stateStorage.unlock();
        return undefined;
    } catch (error) {
        return {
            errorCode : ErrorCode.CANNOT_UNLOCK,
            error,
        };
    }
}
