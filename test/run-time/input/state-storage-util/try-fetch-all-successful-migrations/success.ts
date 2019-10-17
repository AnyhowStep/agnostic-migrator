import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();

    await stateStorage.setSuccessfulMigration({
        identifier : "0",
        migratedUp : true,
        timestamp : 9999,
        batchNumber : 1,
    });
    await stateStorage.setSuccessfulMigration({
        identifier : "1",
        migratedUp : false,
        timestamp : 9999,
        batchNumber : 79,
    });
    await stateStorage.setSuccessfulMigration({
        identifier : "2",
        migratedUp : false,
        timestamp : 9001,
        batchNumber : 23,
    });

    const result = await migrator.StateStorageUtil.tryFetchAllSuccessfulMigrations(stateStorage);
    t.deepEqual(
        result,
        {
            errorCode : undefined,
            successfulMigrations : [
                {
                    identifier : "0",
                    migratedUp : true,
                    timestamp : 9999,
                    batchNumber : 1,
                },
                {
                    identifier : "1",
                    migratedUp : false,
                    timestamp : 9999,
                    batchNumber : 79,
                },
                {
                    identifier : "2",
                    migratedUp : false,
                    timestamp : 9001,
                    batchNumber : 23,
                },
            ],
        }
    );

    t.end();
});
