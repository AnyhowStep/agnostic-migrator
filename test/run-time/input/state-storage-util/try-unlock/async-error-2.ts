import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    await stateStorage.tryLock();

    stateStorage.unlock = async () => {
        throw "Async error";
    };

    const result = await migrator.StateStorageUtil.tryUnlock(stateStorage);
    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.CANNOT_UNLOCK,
            error : "Async error",
        }
    );

    t.end();
});
