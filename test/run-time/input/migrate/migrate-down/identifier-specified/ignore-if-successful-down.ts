import * as migrator from "../../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../../in-memory-state-storage";
import {mockMigrations} from "../../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations();

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "1",
        migratedUp : false,
        timestamp : 9999,
        batchNumber : 1,
    });
    dataStorage.push({
        identifier : "1",
        migratedUp : false,
    });

    const migrateDownResult = await migrator.migrateDown({
        migrations,
        stateStorage,
        identifier : "1",
    });

    await stateStorage.fetchAllSuccessfulMigrations()
        .then((successfulMigrations) => {
            t.deepEqual(
                successfulMigrations,
                [
                    {
                        identifier : "1",
                        migratedUp : false,
                        timestamp : 9999,
                        batchNumber : 1,
                    },
                ]
            );
        });

    await stateStorage.tryLock()
        .then((success) => {
            t.deepEqual(success, true);
        });

    await stateStorage.unlock();

    t.deepEqual(
        dataStorage,
        [
            {
                identifier : "1",
                migratedUp : false,
            }
        ]
    );

    t.deepEqual(migrateDownResult.errors, []);
    t.deepEqual(migrateDownResult.identifier, "1");
    t.deepEqual(
        migrateDownResult.newSuccessfulMigration,
        undefined
    );

    t.end();
});
