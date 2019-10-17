import {SuccessfulMigration} from "../successful-migration";
import {maxBatchNumber} from "./max-batch-number";

/**
 * Returns a new `batchNumber` that is greater than all other existing batch numbers.
 */
export function newBatchNumber (successfulMigrations : readonly SuccessfulMigration[]) : number {
    return maxBatchNumber(successfulMigrations) + 1;
}
