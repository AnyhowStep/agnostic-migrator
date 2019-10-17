import {StateStorage} from "../state-storage";
import {ErrorCode, AlreadyLockedError, CannotTryLockError} from "../migration-error";

/**
 * This should not throw an error
 */
export async function tryLock (stateStorage : StateStorage) : Promise<undefined|AlreadyLockedError|CannotTryLockError> {
    try {
        const lockedSuccessfully = await stateStorage.tryLock();
        if (lockedSuccessfully) {
            return undefined;
        } else {
            return {
                errorCode : ErrorCode.ALREADY_LOCKED,
            } as const;
        }
    } catch (error) {
        return {
            errorCode : ErrorCode.CANNOT_TRY_LOCK,
            error,
        } as const;
    }
}
