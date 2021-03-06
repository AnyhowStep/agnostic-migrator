import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const pendingMigration = mockMigrations(1).migrations[0];
    (pendingMigration as { down : migrator.Migration["down"] }).down = async () => {
        throw "Async error";
    };

    const stateStorage = new InMemoryStateStorage();
    const result = await migrator.MigrationUtil.tryRunMigration(
        {
            pendingMigration,
            batchNumber : 1,
            stateStorage,
            direction : "down",
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
