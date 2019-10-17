import {SuccessfulMigration} from "../successful-migration";
import {MigrateArgs} from "../migrate-args";
import {MigrationError} from "../migration-error";
import * as MigrationErrorUtil from "../migration-error-util";
import * as MigrationUtil from "../migration-util";
import * as StateStorageUtil from "../state-storage-util";
import * as SuccessfulMigrationUtil from "../successful-migration-util";
import * as Util from "../util";

export interface RollbackLastBatchArgs extends MigrateArgs {
}
export interface RollbackLastBatchResult {
    /**
     * An array of new successful down migrations.
     */
    readonly newSuccessfulMigrations : readonly SuccessfulMigration[];
    readonly errors : readonly MigrationError[],
}

export async function rollbackLastBatch ({migrations, stateStorage} : RollbackLastBatchArgs) : Promise<RollbackLastBatchResult> {
    const lockAndValidateResult = await Util.tryLockAndValidateSuccessfulMigrations({migrations, stateStorage});
    if (!lockAndValidateResult.success) {
        return {
            newSuccessfulMigrations : [],
            errors : lockAndValidateResult.errors,
        };
    }
    const {validatedSuccessfulMigrations} = lockAndValidateResult;

    const newSuccessfulMigrations : SuccessfulMigration[] = [];
    const batchNumber = SuccessfulMigrationUtil.maxBatchNumber(validatedSuccessfulMigrations);
    const pendingDownMigrations = SuccessfulMigrationUtil.extractSuccessfulUpMigrationsWithBatchNumber(
        validatedSuccessfulMigrations,
        batchNumber
    );

    /**
     * We reverse the array to run the down migrations in the correct order.
     */
    pendingDownMigrations.reverse();
    for (const pendingMigration of pendingDownMigrations) {
        const tryRunMigrationResult = await MigrationUtil.tryRunMigration({
            pendingMigration : pendingMigration.migration,
            batchNumber : pendingMigration.batchNumber,
            stateStorage,
            direction : "down",
        });
        if (!tryRunMigrationResult.success) {
            return {
                newSuccessfulMigrations,
                errors : tryRunMigrationResult.errors,
            };
        }

        newSuccessfulMigrations.push(tryRunMigrationResult.successfulMigration);
    }

    return {
        newSuccessfulMigrations,
        errors : MigrationErrorUtil.normalizeMigrationErrors(
            await StateStorageUtil.tryUnlock(stateStorage)
        ),
    };
}
