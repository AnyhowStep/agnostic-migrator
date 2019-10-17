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
        identifier : "2",
        migratedUp : true,
        timestamp : 9999,
        batchNumber : 2,
    });
    dataStorage.push({
        identifier : "2",
        migratedUp : true,
    });

    /**
     * Pretend we have already run this migration
     */
    await stateStorage.setSuccessfulMigration({
        identifier : "1",
        migratedUp : true,
        timestamp : 9999,
        batchNumber : 3,
    });
    dataStorage.push({
        identifier : "1",
        migratedUp : true,
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
                        identifier : "2",
                        migratedUp : false,
                        timestamp : (
                            migrateDownResult.newSuccessfulMigration == undefined ?
                            undefined :
                            migrateDownResult.newSuccessfulMigration.timestamp
                        ),
                        batchNumber : 2,
                    },
                    {
                        identifier : "1",
                        migratedUp : true,
                        timestamp : 9999,
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
                identifier : "2",
                migratedUp : true,
            },
            {
                identifier : "1",
                migratedUp : true,
            },
            {
                identifier : "2",
                migratedUp : false,
            }
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
            batchNumber : 2,
        }
    );

    const migrateDownResult2 = await migrator.migrateDown({
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
                        identifier : "2",
                        migratedUp : false,
                        timestamp : (
                            migrateDownResult.newSuccessfulMigration == undefined ?
                            undefined :
                            migrateDownResult.newSuccessfulMigration.timestamp
                        ),
                        batchNumber : 2,
                    },
                    {
                        identifier : "1",
                        migratedUp : false,
                        timestamp : (
                            migrateDownResult2.newSuccessfulMigration == undefined ?
                            undefined :
                            migrateDownResult2.newSuccessfulMigration.timestamp
                        ),
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
                identifier : "2",
                migratedUp : true,
            },
            {
                identifier : "1",
                migratedUp : true,
            },
            {
                identifier : "2",
                migratedUp : false,
            },
            {
                identifier : "1",
                migratedUp : false,
            }
        ]
    );

    t.deepEqual(migrateDownResult2.errors, []);
    t.deepEqual(migrateDownResult2.identifier, "1");
    t.deepEqual(
        migrateDownResult2.newSuccessfulMigration,
        {
            identifier : "1",
            migratedUp : false,
            timestamp : (
                migrateDownResult2.newSuccessfulMigration == undefined ?
                undefined :
                migrateDownResult2.newSuccessfulMigration.timestamp
            ),
            batchNumber : 3,
        }
    );

    t.end();
});
