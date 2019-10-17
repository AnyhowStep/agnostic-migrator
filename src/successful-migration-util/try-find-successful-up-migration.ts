import {SuccessfulMigration} from "../successful-migration";
import {Migration} from "../migration";

/**
 * Returns the `SuccessfulMigration` with the specified `identifier`,
 * or `undefined`, if not found.
 */
export function tryFindSuccessfulUpMigration<T extends SuccessfulMigration> (
    successfulMigrations : readonly T[],
    migration : Pick<Migration, "identifier">
) : T|undefined {
    return successfulMigrations.find(
        successfulMigration => (
            successfulMigration.identifier == migration.identifier &&
            successfulMigration.migratedUp
        )
    );
}
