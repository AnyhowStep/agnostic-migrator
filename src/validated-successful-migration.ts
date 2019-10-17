import {SuccessfulMigration} from "./successful-migration";
import {Migration} from "./migration";

/**
 * A validated `SuccessfulMigration` knows about the `Migration` implementation that was run.
 */
export interface ValidatedSuccessfulMigration extends SuccessfulMigration {
    readonly migrationIndex : number;
    readonly migration : Migration;
}
