import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    stateStorage.tryLock = async () => {
        throw "Async error";
    };

    const result = await migrator.StateStorageUtil.tryLock(stateStorage);
    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.CANNOT_TRY_LOCK,
            error : "Async error",
        }
    );

    t.end();
});
