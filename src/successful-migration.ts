/**
 * The `identifier` should be a unique key.
 */
export interface SuccessfulMigration {
    /**
     * The unique identifier of the `Migration` that was successful.
     */
    readonly identifier : string,
    /**
     * If `true`, this was a successful `up` migration.
     * If `false` this was a successful `down` migration.
     */
    readonly migratedUp : boolean,
    /**
     * Number of milliseconds since the UNIX epoch.
     *
     * This should always be an integer.
     */
    readonly timestamp : number,
    /**
     * The batch this successful migration belongs to.
     * A batch may contain multiple migrations.
     *
     * Larger batch numbers occurred later than smaller batch numbers.
     *
     * This should always be an integer.
     */
    readonly batchNumber : number,
}
