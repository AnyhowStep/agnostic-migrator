import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const pendingMigration = mockMigrations(1).migrations[0];
    (pendingMigration as { up : migrator.Migration["up"] }).up = () => {
        return Promise.reject("Async error");
    };

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
        t.fail("Expected to error");
    } else {
        t.deepEqual(
            result,
            {
                success : false,
                errors : [
                    {
                        errorCode : migrator.ErrorCode.PENDING_MIGRATION_FAILED,
                        pendingMigration,
                        error : "Async error",
                    }
                ]
            }
        );
    }

    t.end();
});
