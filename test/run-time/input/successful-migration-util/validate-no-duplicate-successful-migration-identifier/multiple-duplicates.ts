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

    const successfulMigration5 = successfulMigrations[5];

    const successfulMigration8 = successfulMigrations[8];

    const successfulMigration2 = successfulMigrations[2];

    successfulMigrations.splice(
        3,
        0,
        {
            ...successfulMigration5
        }
    );

    successfulMigrations.splice(
        7,
        0,
        {
            ...successfulMigration5
        }
    );

    successfulMigrations.splice(
        0,
        0,
        {
            ...successfulMigration8
        }
    );

    successfulMigrations.splice(
        8,
        0,
        {
            ...successfulMigration2
        }
    );

    const result = await migrator.SuccessfulMigrationUtil.validateNoDuplicateSuccessfulMigrationIdentifier(
        successfulMigrations
    );

    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND,
            duplicates : ["5", "2", "8"]
        }
    );

    t.end();
});
