import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations(3);

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "0",
        migratedUp : true,
        timestamp : 9999,
        batchNumber : 1,
    });
    dataStorage.push({
        identifier : "0",
        migratedUp : true,
    });

    const migrateUpToLatestResult = await migrator.migrateUpToLatest({
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
                        migratedUp : true,
                        timestamp : 9999,
                        batchNumber : 1,
                    },
                    {
                        identifier : "1",
                        migratedUp : true,
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[0].timestamp,
                        batchNumber : 2,
                    },
                    {
                        identifier : "2",
                        migratedUp : true,
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[1].timestamp,
                        batchNumber : 2,
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
            }
        ]
    );

    t.deepEqual(migrateUpToLatestResult.errors, []);
    t.deepEqual(
        migrateUpToLatestResult.newSuccessfulMigrations,
        [
            {
                identifier : "1",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[0].timestamp,
                batchNumber : 2,
            },
            {
                identifier : "2",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[1].timestamp,
                batchNumber : 2,
            }
        ]
    );

    t.end();
});
