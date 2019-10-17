import {Migration} from "../migration";
import {StateStorage} from "../state-storage";
import {PendingMigrationFailedError, CannotSetSuccessfulMigrationError, ErrorCode} from "../migration-error";
import {SuccessfulMigration} from "../successful-migration";

export interface TryRunMigrationArgs {
    pendingMigration : Migration,
    batchNumber : number,
    stateStorage : StateStorage,
    direction : "up"|"down",
}
export async function tryRunMigration (
    {
        pendingMigration,
        batchNumber,
        stateStorage,
        direction,
    } : TryRunMigrationArgs
) : (
    Promise<
        | {
            success : false,
            errors : readonly (
                | PendingMigrationFailedError
                | CannotSetSuccessfulMigrationError
            )[],
        }
        | {
            success : true,
            successfulMigration : SuccessfulMigration,
        }
    >
) {
    try {
        await pendingMigration[direction]();
    } catch (error) {
        return {
            success : false,
            errors : [
                {
                    errorCode : ErrorCode.PENDING_MIGRATION_FAILED,
                    pendingMigration,
                    error,
                },
            ],
        };
    }
    const successfulMigration : SuccessfulMigration = {
        identifier : pendingMigration.identifier,
        migratedUp : (direction == "up"),
        timestamp : Date.now(),
        batchNumber,
    };
    try {
        await stateStorage.setSuccessfulMigration(successfulMigration);
    } catch (error) {
        return {
            success : false,
            errors : [
                {
                    errorCode : ErrorCode.CANNOT_SET_SUCCESSFUL_MIGRATION,
                    pendingMigration,
                    successfulMigration,
                    error,
                },
            ],
        };
    }

    return {
        success : true,
        successfulMigration,
    };
}
