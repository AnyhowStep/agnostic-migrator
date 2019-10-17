import {SuccessfulMigration} from "../successful-migration";

/**
 * Used by `rollbackAll()` to find all successful up migrations.
 *
 * Used by `migrateDown()` to find the last successful up migration.
 */
export function extractSuccessfulUpMigrations<T extends SuccessfulMigration>(
    successfulMigrations : readonly T[]
) : T[] {
    return successfulMigrations.filter(
        successfulMigration => successfulMigration.migratedUp
    );
}
