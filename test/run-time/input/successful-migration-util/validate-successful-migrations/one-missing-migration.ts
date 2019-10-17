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

    /**
     * This removes one of the migrations
     */
    migrations.splice(3, 1);

    const result = await migrator.SuccessfulMigrationUtil.validateSuccessfulMigrations(
        successfulMigrations,
        migrations
    );

    t.deepEqual(
        result,
        {
            errorCode : migrator.ErrorCode.SUCCESSFUL_MIGRATIONS_DO_NOT_EXIST,
            missingSuccessfulMigrations : [
                {
                    ...successfulMigrations[3],
                    migrationIndex : -1,
                    migration : undefined,
                }
            ],
        }
    );

    t.end();
});
