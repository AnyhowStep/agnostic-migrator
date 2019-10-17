import {SuccessfulMigration} from "../successful-migration";

/**
 * Returns the highest `batchNumber` found in the array of successful migrations.
 *
 * If the array is empty, it returns zero.
 */
export function maxBatchNumber (successfulMigrations : readonly SuccessfulMigration[]) : number {
    return successfulMigrations.reduce(
        (max, successfulMigration) => {
            return (successfulMigration.batchNumber > max) ?
                successfulMigration.batchNumber :
                max;
        },
        0
    );
}
