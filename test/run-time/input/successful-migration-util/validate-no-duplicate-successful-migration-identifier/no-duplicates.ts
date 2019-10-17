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

    const result = await migrator.SuccessfulMigrationUtil.validateNoDuplicateSuccessfulMigrationIdentifier(
        successfulMigrations
    );

    t.deepEqual(result, undefined);

    t.end();
});
