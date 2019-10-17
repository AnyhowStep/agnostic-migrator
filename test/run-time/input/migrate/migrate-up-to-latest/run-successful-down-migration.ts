import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../in-memory-state-storage";
import {mockMigrations} from "../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations(4);

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "0",
        migratedUp : false,
        timestamp : 9999,
        batchNumber : 1,
    });
    dataStorage.push({
        identifier : "0",
        migratedUp : false,
    });

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "2",
        migratedUp : false,
        timestamp : 9999,
        batchNumber : 2,
    });
    dataStorage.push({
        identifier : "2",
        migratedUp : false,
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
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[0].timestamp,
                        batchNumber : 3,
                    },
                    {
                        identifier : "2",
                        migratedUp : true,
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[2].timestamp,
                        batchNumber : 3,
                    },
                    {
                        identifier : "1",
                        migratedUp : true,
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[1].timestamp,
                        batchNumber : 3,
                    },
                    {
                        identifier : "3",
                        migratedUp : true,
                        timestamp : migrateUpToLatestResult.newSuccessfulMigrations[3].timestamp,
                        batchNumber : 3,
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
                migratedUp : false,
            },
            {
                identifier : "2",
                migratedUp : false,
            },
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
                identifier : "3",
                migratedUp : true,
            }
        ]
    );

    t.deepEqual(migrateUpToLatestResult.errors, []);
    t.deepEqual(
        migrateUpToLatestResult.newSuccessfulMigrations,
        [
            {
                identifier : "0",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[0].timestamp,
                batchNumber : 3,
            },
            {
                identifier : "1",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[1].timestamp,
                batchNumber : 3,
            },
            {
                identifier : "2",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[2].timestamp,
                batchNumber : 3,
            },
            {
                identifier : "3",
                migratedUp : true,
                timestamp : migrateUpToLatestResult.newSuccessfulMigrations[3].timestamp,
                batchNumber : 3,
            }
        ]
    );

    t.end();
});
