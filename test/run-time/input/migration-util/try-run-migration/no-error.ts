import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const pendingMigration = mockMigrations(1).migrations[0];
    const stateStorage = new InMemoryStateStorage();

    const result = await migrator.MigrationUtil.tryRunMigration(
        {
            pendingMigration,
            batchNumber : 1,
            stateStorage,
            direction : "up",
        }
    );

    if (result.success) {
        t.deepEqual(
            result,
            {
                success : true,
                successfulMigration : {
                    identifier : pendingMigration.identifier,
                    migratedUp : true,
                    timestamp : result.successfulMigration.timestamp,
                    batchNumber : 1,
                }
            }
        );
    } else {
        t.fail("Expected to succeed");
    }

    t.end();
});
