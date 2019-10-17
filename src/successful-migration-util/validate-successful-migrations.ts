import {SuccessfulMigration} from "../successful-migration";
import {Migration} from "../migration";
import {ValidatedSuccessfulMigration} from "../validated-successful-migration";
import {
    SuccessfulMigrationsDoNotExistError,
    DuplicateMigrationIdentifierFoundError,
    DuplicateSuccessfulMigrationIdentifierFoundError,
    ErrorCode,
} from "../migration-error";
import {validateNoDuplicateMigrationIdentifier} from "../migration-util";
import {validateNoDuplicateSuccessfulMigrationIdentifier} from "./validate-no-duplicate-successful-migration-identifier";

/**
 * Returns `ValidatedSuccessfulMigration[]`, if there are no errors.
 *
 * The returned array will have the same relative order as the corresponding `migration`.
 */
export function validateSuccessfulMigrations (
    successfulMigrations : readonly SuccessfulMigration[],
    migrations : readonly Migration[]
) : (
    | {
        readonly errorCode : undefined,
        readonly validatedSuccessfulMigrations : readonly ValidatedSuccessfulMigration[]
    }
    | SuccessfulMigrationsDoNotExistError
    | DuplicateMigrationIdentifierFoundError
    | DuplicateSuccessfulMigrationIdentifierFoundError
) {
    const duplicateMigrationIdentifierFoundError = validateNoDuplicateMigrationIdentifier(migrations);
    if (duplicateMigrationIdentifierFoundError != undefined) {
        return duplicateMigrationIdentifierFoundError;
    }

    const duplicateSuccessfulMigrationIdentifierFoundError = validateNoDuplicateSuccessfulMigrationIdentifier(successfulMigrations);
    if (duplicateSuccessfulMigrationIdentifierFoundError != undefined) {
        return duplicateSuccessfulMigrationIdentifierFoundError;
    }

    const result = successfulMigrations.map(successfulMigration => {
        const migrationIndex = migrations.findIndex(
            migration => migration.identifier == successfulMigration.identifier
        );
        return {
            ...successfulMigration,
            migrationIndex,
            migration : migrationIndex < 0 ?
                undefined :
                migrations[migrationIndex],
        };
    });
    /**
     * Sort the `SuccessfulMigration`s so they make sense.
     */
    result.sort((a, b) => {
        return a.migrationIndex - b.migrationIndex;
    });
    const missingSuccessfulMigrations = result.filter(successfulMigration => {
        return successfulMigration.migration == undefined;
    });
    if (missingSuccessfulMigrations.length > 0) {
        return {
            errorCode : ErrorCode.SUCCESSFUL_MIGRATIONS_DO_NOT_EXIST,
            missingSuccessfulMigrations,
        };
    } else {
        return {
            errorCode : undefined,
            validatedSuccessfulMigrations : result as readonly ValidatedSuccessfulMigration[]
        };
    }
}
