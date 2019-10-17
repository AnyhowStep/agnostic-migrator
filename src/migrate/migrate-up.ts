import {SuccessfulMigration} from "../successful-migration";
import {MigrateArgs} from "../migrate-args";
import {MigrationError, ErrorCode} from "../migration-error";
import * as MigrationErrorUtil from "../migration-error-util";
import * as MigrationUtil from "../migration-util";
import * as StateStorageUtil from "../state-storage-util";
import * as SuccessfulMigrationUtil from "../successful-migration-util";
import * as Util from "../util";

export interface MigrateUpArgs extends MigrateArgs {
    /**
     * The `identifier` of the up `Migration` to run.
     *
     * If `undefined`, the first pending up migration is run.
     */
    identifier : string|undefined,
}
export type MigrateUpResult =
    | {
        /**
         * If `undefined`, no identifier was specified and no pending up migration was found.
         */
        readonly identifier : string|undefined,
        /**
         * The new successful migration.
         * If `undefined`, no up migration was successfully run.
         */
        readonly newSuccessfulMigration : SuccessfulMigration|undefined;
        readonly errors : readonly MigrationError[],
    }
    | {
        readonly identifier : string,
        /**
         * The new successful migration.
         */
        readonly newSuccessfulMigration : SuccessfulMigration;
        readonly errors : readonly MigrationError[],
    }
;
export async function migrateUp ({migrations, stateStorage, identifier} : MigrateUpArgs) : Promise<MigrateUpResult> {
    const lockAndValidateResult = await Util.tryLockAndValidateSuccessfulMigrations({migrations, stateStorage});
    if (!lockAndValidateResult.success) {
        return {
            identifier,
            newSuccessfulMigration : undefined,
            errors : lockAndValidateResult.errors,
        };
    }
    const {validatedSuccessfulMigrations} = lockAndValidateResult;

    if (identifier == undefined) {
        const pendingUpMigrations = MigrationUtil.extractPendingUpMigrations(migrations, validatedSuccessfulMigrations);
        if (pendingUpMigrations.length > 0) {
            /**
             * No `identifier` was specified.
             * Take the first pending up migration.
             */
            identifier = pendingUpMigrations[0].identifier;
        }
    }

    if (identifier == undefined) {
        return {
            identifier,
            newSuccessfulMigration : undefined,
            /**
             * No up migration to run.
             * It is safe to remove the migration lock.
             */
            errors : MigrationErrorUtil.normalizeMigrationErrors(
                await StateStorageUtil.tryUnlock(stateStorage)
            ),
        };
    } else {
        const migration = migrations.find(migration => migration.identifier == identifier);

        if (migration == undefined) {
            return {
                identifier,
                newSuccessfulMigration : undefined,
                errors : MigrationErrorUtil.normalizeMigrationErrors(
                    {
                        errorCode : ErrorCode.MIGRATION_DOES_NOT_EXIST,
                        identifier,
                    },
                    /**
                     * No up migration was run.
                     * It is safe to remove the migration lock.
                     */
                    await StateStorageUtil.tryUnlock(stateStorage)
                ),
            };
        }

        if (!MigrationUtil.isPendingUpMigration(migration, validatedSuccessfulMigrations)) {
            return {
                identifier,
                newSuccessfulMigration : undefined,
                /**
                 * No up migration was run.
                 * It is safe to remove the migration lock.
                 */
                errors : MigrationErrorUtil.normalizeMigrationErrors(
                    await StateStorageUtil.tryUnlock(stateStorage)
                ),
            };
        }

        const batchNumber = SuccessfulMigrationUtil.newBatchNumber(validatedSuccessfulMigrations);
        const tryRunMigrationResult = await MigrationUtil.tryRunMigration({
            pendingMigration : migration,
            batchNumber,
            stateStorage,
            direction : "up",
        });
        if (!tryRunMigrationResult.success) {
            return {
                identifier,
                newSuccessfulMigration : undefined,
                errors : tryRunMigrationResult.errors,
            };
        }

        return {
            identifier,
            newSuccessfulMigration : tryRunMigrationResult.successfulMigration,
            errors : MigrationErrorUtil.normalizeMigrationErrors(
                await StateStorageUtil.tryUnlock(stateStorage)
            ),
        };
    }
}
