import * as migrator from "../../../../../../dist";
import * as tape from "tape";
import {InMemoryStateStorage} from "../../../in-memory-state-storage";
import {mockMigrations} from "../../../mock-migrations";

tape(__filename, async (t) => {
    const stateStorage = new InMemoryStateStorage();
    const {dataStorage, migrations} = mockMigrations();
    const migrateUpResult = await migrator.migrateUp({
        migrations,
        stateStorage,
        identifier : "does-not-exist",
    });

    await stateStorage.fetchAllSuccessfulMigrations()
        .then((successfulMigrations) => {
            t.deepEqual(
                successfulMigrations,
                []
            );
        });

    await stateStorage.tryLock()
        .then((success) => {
            t.deepEqual(success, true);
        });

    await stateStorage.unlock();

    t.deepEqual(
        dataStorage,
        []
    );

    t.deepEqual(migrateUpResult.errors, [
        {
            errorCode : migrator.ErrorCode.MIGRATION_DOES_NOT_EXIST,
            identifier : "does-not-exist",
        }
    ]);
    t.deepEqual(migrateUpResult.identifier, "does-not-exist");
    t.deepEqual(
        migrateUpResult.newSuccessfulMigration,
        undefined
    );

    t.end();
});
