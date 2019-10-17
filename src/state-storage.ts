import {SuccessfulMigration} from "./successful-migration";

/**
 * A persistent storage interface for keeping track of which migrations were completed,
 * and whether it is safe to run a migration.
 */
export interface StateStorage {
    /**
     * Called after a successful `up` migration.
     */
    readonly setSuccessfulMigration : (successfulMigration : SuccessfulMigration) => Promise<void>;
    /**
     * Just needs to fetch all `SuccessfulMigration`s.
     * Does not need to sort it.
     *
     * -----
     *
     * It should be fine to return all successful migrations
     * and should not result in an OOM... In general.
     *
     * If you have enough successful migrations that loading
     * them all in memory will cause an OOM, you should find a more robust solution.
     *
     * -----
     *
     * Alternatively, we can just modify the API to return
     * a paginated list of successful migrations...
     */
    readonly fetchAllSuccessfulMigrations : () => Promise<readonly SuccessfulMigration[]>;

    /**
     * Tries to create a lock so we do not have multiple migrations happening at the same time.
     *
     * If a lock already exists, it should return `false`.
     * If a lock did not exist, it should create the lock and return `true`.
     *
     * If the migration fails halfway, you will need to,
     * 1. Manually resolve the problem
     * 2. Manually remove the lock
     * 3. Run the migration again
     */
    readonly tryLock : () => Promise<boolean>;
    /**
     * Removes the lock, if any.
     * If there's no lock, it may throw an error or choose to do nothing.
     * Throwing is recommended.
     */
    readonly unlock : () => Promise<void>;
}
