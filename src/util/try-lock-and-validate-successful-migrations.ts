import {MigrateArgs} from "../migrate-args";
import {
    AlreadyLockedError,
    CannotTryLockError,
    SuccessfulMigrationsDoNotExistError,
    CannotUnlockError,
    DuplicateMigrationIdentifierFoundError,
    DuplicateSuccessfulMigrationIdentifierFoundError,
    CannotFetchAllSuccessfulMigrationsError,
} from "../migration-error";
import {ValidatedSuccessfulMigration} from "../validated-successful-migration";
import * as MigrationErrorUtil from "../migration-error-util";
import * as StateStorageUtil from "../state-storage-util";
import * as SuccessfulMigrationUtil from "../successful-migration-util";

export async function tryLockAndValidateSuccessfulMigrations ({migrations, stateStorage} : MigrateArgs) : (
    Promise<(
        | {
            success : false,
            errors : readonly (
                | AlreadyLockedError
                | CannotTryLockError
                | SuccessfulMigrationsDoNotExistError
                | CannotUnlockError
                | DuplicateMigrationIdentifierFoundError
                | DuplicateSuccessfulMigrationIdentifierFoundError
                | CannotFetchAllSuccessfulMigrationsError
            )[],
        }
        | {
            success : true,
            validatedSuccessfulMigrations : readonly ValidatedSuccessfulMigration[],
        }
    )>
) {
    const tryLockError = await StateStorageUtil.tryLock(stateStorage);
    if (tryLockError != undefined) {
        return {
            success : false,
            errors : [tryLockError]
        };
    }

    const successfulMigrationsResult = await StateStorageUtil.tryFetchAllSuccessfulMigrations(stateStorage);
    if (successfulMigrationsResult.errorCode != undefined) {
        return {
            success : false,
            errors : MigrationErrorUtil.normalizeMigrationErrors(
                successfulMigrationsResult,
                /**
                 * It's okay to unlock at this stage.
                 * We have not even begun to run any migrations.
                 */
                await StateStorageUtil.tryUnlock(stateStorage)
            ),
        };
    }
    const {successfulMigrations} = successfulMigrationsResult;
    const validateSuccessfulMigrationsResult = SuccessfulMigrationUtil.validateSuccessfulMigrations(
        successfulMigrations,
        migrations
    );
    if (validateSuccessfulMigrationsResult.errorCode != undefined) {
        return {
            success : false,
            errors : MigrationErrorUtil.normalizeMigrationErrors(
                validateSuccessfulMigrationsResult,
                /**
                 * It's okay to unlock at this stage.
                 * We have not even begun to run any migrations.
                 */
                await StateStorageUtil.tryUnlock(stateStorage)
            ),
        };
    }

    return {
        success : true,
        validatedSuccessfulMigrations : validateSuccessfulMigrationsResult.validatedSuccessfulMigrations,
    };
}
