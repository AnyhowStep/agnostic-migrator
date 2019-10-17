import * as migrator from "../../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../../in-memory-state-storage";
import {mockMigrations} from "../../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations(4);

    await migrator.migrateUpToLatest({
        migrations,
        stateStorage,
    });

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

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "3",
        migratedUp : false,
        timestamp : 9999,
        batchNumber : 1,
    });
    dataStorage.push({
        identifier : "3",
        migratedUp : false,
    });

    const migrateDownResult = await migrator.migrateDown({
        migrations,
        stateStorage,
        identifier : undefined,
    });

    await stateStorage.fetchAllSuccessfulMigrations()
        .then((successfulMigrations) => {
            t.deepEqual(
                successfulMigrations,
                [
                    {
                        identifier : "0",
                        migratedUp : true,
                        timestamp : successfulMigrations[0].timestamp,
                        batchNumber : 1,
                    },
                    {
                        identifier : "1",
                        migratedUp : false,
                        timestamp : 9999,
                        batchNumber : 1,
                    },
                    {
                        identifier : "2",
                        migratedUp : false,
                        timestamp : (
                            migrateDownResult.newSuccessfulMigration == undefined ?
                            undefined :
                            migrateDownResult.newSuccessfulMigration.timestamp
                        ),
                        batchNumber : 1,
                    },
                    {
                        identifier : "3",
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
            },
            {
                identifier : "1",
                migratedUp : false,
            },
            {
                identifier : "3",
                migratedUp : false,
            },
            {
                identifier : "2",
                migratedUp : false,
            },
        ]
    );

    t.deepEqual(migrateDownResult.errors, []);
    t.deepEqual(migrateDownResult.identifier, "2");
    t.deepEqual(
        migrateDownResult.newSuccessfulMigration,
        {
            identifier : "2",
            migratedUp : false,
            timestamp : (
                migrateDownResult.newSuccessfulMigration == undefined ?
                undefined :
                migrateDownResult.newSuccessfulMigration.timestamp
            ),
            batchNumber : 1,
        }
    );

    t.end();
});
