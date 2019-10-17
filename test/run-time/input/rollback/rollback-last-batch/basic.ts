import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations(3);

    await migrator.migrateUpToLatest({
        migrations,
        stateStorage,
    });

    const rollbackLastBatchResult = await migrator.rollbackLastBatch({
        migrations,
        stateStorage,
    });

    await stateStorage.fetchAllSuccessfulMigrations()
        .then((successfulMigrations) => {
            t.deepEqual(
                successfulMigrations,
                [
                    {
                        identifier : "0",
                        migratedUp : false,
                        timestamp : rollbackLastBatchResult.newSuccessfulMigrations[2].timestamp,
                        batchNumber : 1,
                    },
                    {
                        identifier : "1",
                        migratedUp : false,
                        timestamp : rollbackLastBatchResult.newSuccessfulMigrations[1].timestamp,
                        batchNumber : 1,
                    },
                    {
                        identifier : "2",
                        migratedUp : false,
                        timestamp : rollbackLastBatchResult.newSuccessfulMigrations[0].timestamp,
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
                identifier : "0",
                migratedUp : true,
            },
            {
                identifier : "1",
                migratedUp : true,
            },
            {
                identifier : "2",
                migratedUp : true,
            },
            {
                identifier : "2",
                migratedUp : false,
            },
            {
                identifier : "1",
                migratedUp : false,
            },
            {
                identifier : "0",
                migratedUp : false,
            },
        ]
    );

    t.deepEqual(rollbackLastBatchResult.errors, []);
    t.deepEqual(
        rollbackLastBatchResult.newSuccessfulMigrations,
        [
            {
                identifier : "2",
                migratedUp : false,
                timestamp : rollbackLastBatchResult.newSuccessfulMigrations[0].timestamp,
                batchNumber : 1,
            },
            {
                identifier : "1",
                migratedUp : false,
                timestamp : rollbackLastBatchResult.newSuccessfulMigrations[1].timestamp,
                batchNumber : 1,
            },
            {
                identifier : "0",
                migratedUp : false,
                timestamp : rollbackLastBatchResult.newSuccessfulMigrations[2].timestamp,
                batchNumber : 1,
            },
        ]
    );

    t.end();
});
