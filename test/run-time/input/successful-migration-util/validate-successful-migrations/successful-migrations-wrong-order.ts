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

    const result = await migrator.SuccessfulMigrationUtil.validateSuccessfulMigrations(
        /**
         * Now, it's in the wrong order.
         */
        [...successfulMigrations].reverse(),
        migrations
    );

    t.deepEqual(
        result,
        {
            errorCode : undefined,
            /**
             * It should come out in the right order, however.
             */
            validatedSuccessfulMigrations : successfulMigrations.map((successfulMigration, index) => {
                return {
                    ...successfulMigration,
                    migrationIndex : index,
                    migration : migrations[index],
                };
            }),
        }
    );

    t.end();
});
