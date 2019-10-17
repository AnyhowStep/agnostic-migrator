import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const result = await migrator.StateStorageUtil.tryLock(stateStorage);
    t.deepEqual(
        result,
        undefined
    );

    t.end();
});
