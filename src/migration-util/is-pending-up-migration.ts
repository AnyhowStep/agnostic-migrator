import {Migration} from "../migration";
import {SuccessfulMigration} from "../successful-migration";
import {tryFindSuccessfulUpMigration} from "../successful-migration-util";

/**
 * A pending up migration is a migration that has not been run, or has been down-migrated.
 */
export function isPendingUpMigration (
    migration : Pick<Migration, "identifier">,
    successfulMigrations : readonly SuccessfulMigration[]
) : boolean {
    return tryFindSuccessfulUpMigration(successfulMigrations, migration) == undefined;
}
