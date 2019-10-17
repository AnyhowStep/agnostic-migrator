import {StateStorage} from "../state-storage";
import {ErrorCode, CannotFetchAllSuccessfulMigrationsError} from "../migration-error";
import {SuccessfulMigration} from "../successful-migration";

/**
 * This should not throw an error
 */
export async function tryFetchAllSuccessfulMigrations (stateStorage : StateStorage) : (
    Promise<
        | {
            errorCode : undefined,
            successfulMigrations : readonly SuccessfulMigration[],
        }
        | CannotFetchAllSuccessfulMigrationsError
    >
) {
    try {
        const successfulMigrations = await stateStorage.fetchAllSuccessfulMigrations();
        return {
            errorCode : undefined,
            successfulMigrations,
        };
    } catch (error) {
        return {
            errorCode : ErrorCode.CANNOT_FETCH_ALL_SUCCESSFUL_MIGRATIONS,
            error,
        };
    }
}
