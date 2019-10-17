import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const {migrations} = mockMigrations();
    const stateStorage = new InMemoryStateStorage();
    await migrator.migrateUpToLatest({
        migrations,
        stateStorage,
    });
    const successfulMigrations = await stateStorage.fetchAllSuccessfulMigrations();

    successfulMigrations.splice(
        3,
        0,
        {
            ...successfulMigrations[5]
        }
    );

    const result = await migrator.SuccessfulMigrationUtil.validateNoDuplicateSuccessfulMigrationIdentifier(
        successfulMigrations
    );

    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND,
            duplicates : ["5"]
        }
    );

    t.end();
});
