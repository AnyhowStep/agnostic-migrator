import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    /**
     * This should create a migration lock
     */
    await stateStorage.tryLock();

    const result = await migrator.StateStorageUtil.tryLock(stateStorage);
    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.ALREADY_LOCKED,
        }
    );

    t.end();
});
