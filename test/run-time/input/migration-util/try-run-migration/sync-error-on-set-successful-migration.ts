import * as migrator from "../../../../../dist";
import * as tape from "tape";
import {mockMigrations} from "../../mock-migrations";
import {InMemoryStateStorage} from "../../in-memory-state-storage";

tape(__filename, async (t) => {
    const pendingMigration = mockMigrations(1).migrations[0];
    const stateStorage = new InMemoryStateStorage();

    stateStorage.setSuccessfulMigration = () => {
        throw "Sync error";
    };

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
        t.deepEqual(result.success, false);
        t.deepEqual(result.errors.length, 1);
        const error = result.errors[0];

        t.deepEqual(
            error,
            {
                errorCode : migrator.ErrorCode.CANNOT_SET_SUCCESSFUL_MIGRATION,
                pendingMigration,
                successfulMigration : {
                    identifier : pendingMigration.identifier,
                    migratedUp : true,
                    timestamp : (
                        error.errorCode == migrator.ErrorCode.CANNOT_SET_SUCCESSFUL_MIGRATION ?
                        error.successfulMigration.timestamp :
                        undefined
                    ),
                    batchNumber : 1,
                },
                error : "Sync error",
            }
        );
    }

    t.end();
});
