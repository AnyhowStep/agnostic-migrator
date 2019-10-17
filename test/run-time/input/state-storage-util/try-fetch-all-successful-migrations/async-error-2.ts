import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    stateStorage.fetchAllSuccessfulMigrations = async () => {
        throw "Async error";
    };

    const result = await migrator.StateStorageUtil.tryFetchAllSuccessfulMigrations(stateStorage);
    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.CANNOT_FETCH_ALL_SUCCESSFUL_MIGRATIONS,
            error : "Async error",
        }
    );

    t.end();
});
