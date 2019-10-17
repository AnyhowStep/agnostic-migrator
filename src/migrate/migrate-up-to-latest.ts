import {SuccessfulMigration} from "../successful-migration";
import {MigrateArgs} from "../migrate-args";
import {MigrationError} from "../migration-error";
import * as MigrationErrorUtil from "../migration-error-util";
import * as MigrationUtil from "../migration-util";
import * as StateStorageUtil from "../state-storage-util";
import * as SuccessfulMigrationUtil from "../successful-migration-util";
import * as Util from "../util";

export interface MigrateUpToLatestArgs extends MigrateArgs {
}
export interface MigrateUpToLatestResult {
    /**
     * An array of new successful up migrations.
     */
    readonly newSuccessfulMigrations : readonly SuccessfulMigration[];
    readonly errors : readonly MigrationError[],
}
export async function migrateUpToLatest ({migrations, stateStorage} : MigrateUpToLatestArgs) : Promise<MigrateUpToLatestResult> {
    const lockAndValidateResult = await Util.tryLockAndValidateSuccessfulMigrations({migrations, stateStorage});
    if (!lockAndValidateResult.success) {
        return {
            newSuccessfulMigrations : [],
            errors : lockAndValidateResult.errors,
        };
    }
    const {validatedSuccessfulMigrations} = lockAndValidateResult;

    const newSuccessfulMigrations : SuccessfulMigration[] = [];
    const batchNumber = SuccessfulMigrationUtil.newBatchNumber(validatedSuccessfulMigrations);
    const pendingUpMigrations = MigrationUtil.extractPendingUpMigrations(migrations, validatedSuccessfulMigrations);
    for (const pendingMigration of pendingUpMigrations) {
        const tryRunMigrationResult = await MigrationUtil.tryRunMigration({
            pendingMigration,
            batchNumber,
            stateStorage,
            direction : "up",
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
