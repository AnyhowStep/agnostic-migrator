/**
 * Performs an up migration.
 */
export type UpMigrateDelegate = () => Promise<void>;
/**
 * Performs a down migration.
 */
export type DownMigrateDelegate = () => Promise<void>;

/**
 * Performs up and down migrations.
 */
export interface Migration {
    /**
     * A unique identifier for the migration.
     *
     * If duplicate identifiers are found in a list of migrations, an error is raised.
     */
    readonly identifier : string,
    /**
     * A description associated with the migration.
     */
    readonly description : string,
    /**
     * The function that migrates upwards to a newer version.
     */
    readonly up : UpMigrateDelegate,
    /**
     * The function that migrates downwards to an older version.
     */
    readonly down : DownMigrateDelegate,
}
