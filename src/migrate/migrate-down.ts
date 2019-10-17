import {SuccessfulMigration} from "../successful-migration";
import {MigrateArgs} from "../migrate-args";
import {MigrationError, ErrorCode} from "../migration-error";
import * as MigrationErrorUtil from "../migration-error-util";
import * as MigrationUtil from "../migration-util";
import * as StateStorageUtil from "../state-storage-util";
import * as SuccessfulMigrationUtil from "../successful-migration-util";
import * as Util from "../util";

export interface MigrateDownArgs extends MigrateArgs {
    /**
     * The `identifier` of the down `Migration` to run.
     *
     * If `undefined`, the last successful up migration is down-migrated.
     */
    identifier : string|undefined,
}
export type MigrateDownResult =
    | {
        /**
         * If `undefined`, no identifier was specified and no successful up migration was found.
         */
        readonly identifier : string|undefined,
        /**
         * The new successful migration.
         * If `undefined`, no down migration was successfully run.
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
export async function migrateDown ({migrations, stateStorage, identifier} : MigrateDownArgs) : Promise<MigrateDownResult> {
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
        const successfulUpMigrations = SuccessfulMigrationUtil.extractSuccessfulUpMigrations(validatedSuccessfulMigrations);
        if (successfulUpMigrations.length > 0) {
            /**
             * No `identifier` was specified.
             * Take the last successful up migration.
             */
            identifier = successfulUpMigrations[successfulUpMigrations.length-1].identifier;
        }
    }

    if (identifier == undefined) {
        return {
            identifier,
            newSuccessfulMigration : undefined,
            /**
             * No down migration to run.
             * It is safe to remove the migration lock.
             */
            errors : MigrationErrorUtil.normalizeMigrationErrors(
                await StateStorageUtil.tryUnlock(stateStorage)
            ),
        };
    } else {
        if (migrations.find(migration => migration.identifier == identifier) == undefined) {
            return {
                identifier,
                newSuccessfulMigration : undefined,
                errors : MigrationErrorUtil.normalizeMigrationErrors(
                    {
                        errorCode : ErrorCode.MIGRATION_DOES_NOT_EXIST,
                        identifier,
                    },
                    /**
                     * No down migration was run.
                     * It is safe to remove the migration lock.
                     */
                    await StateStorageUtil.tryUnlock(stateStorage)
                ),
            };
        }

        const successfulUpMigration = SuccessfulMigrationUtil.tryFindSuccessfulUpMigration(validatedSuccessfulMigrations, { identifier });
        if (successfulUpMigration == undefined) {
            return {
                identifier,
                newSuccessfulMigration : undefined,
                /**
                 * No down migration was run.
                 * It is safe to remove the migration lock.
                 */
                errors : MigrationErrorUtil.normalizeMigrationErrors(
                    await StateStorageUtil.tryUnlock(stateStorage)
                ),
            };
        }

        const tryRunMigrationResult = await MigrationUtil.tryRunMigration({
            pendingMigration : successfulUpMigration.migration,
            batchNumber : successfulUpMigration.batchNumber,
            stateStorage,
            direction : "down",
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
