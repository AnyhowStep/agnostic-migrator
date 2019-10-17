import {SuccessfulMigration} from "../successful-migration";

/**
 * Used by `rollbackLastBatch()` to find all successful up migrations belonging to the last batch.
 */
export function extractSuccessfulUpMigrationsWithBatchNumber<T extends SuccessfulMigration>(
    successfulMigrations : readonly T[],
    batchNumber : number
) : T[] {
    return successfulMigrations.filter(
        successfulMigration => (
            successfulMigration.batchNumber == batchNumber &&
            successfulMigration.migratedUp
        )
    );
}
