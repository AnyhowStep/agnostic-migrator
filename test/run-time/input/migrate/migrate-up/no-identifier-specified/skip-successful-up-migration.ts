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
        identifier : "0",
        migratedUp : true,
        timestamp : 9999,
        batchNumber : 1,
    });
    dataStorage.push({
        identifier : "0",
        migratedUp : true,
    });

    const migrateUpResult = await migrator.migrateUp({
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
                        timestamp : 9999,
                        batchNumber : 1,
                    },
                    {
                        identifier : "1",
                        migratedUp : true,
                        timestamp : (
                            migrateUpResult.newSuccessfulMigration == undefined ?
                            undefined :
                            migrateUpResult.newSuccessfulMigration.timestamp
                        ),
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
            }
        ]
    );

    t.deepEqual(migrateUpResult.errors, []);
    t.deepEqual(migrateUpResult.identifier, "1");
    t.deepEqual(
        migrateUpResult.newSuccessfulMigration,
        {
            identifier : "1",
            migratedUp : true,
            timestamp : (
                migrateUpResult.newSuccessfulMigration == undefined ?
                undefined :
                migrateUpResult.newSuccessfulMigration.timestamp
            ),
            batchNumber : 2,
        }
    );

    t.end();
});
