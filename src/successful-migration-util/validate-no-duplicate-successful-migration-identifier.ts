import {SuccessfulMigration} from "../successful-migration";
import {DuplicateSuccessfulMigrationIdentifierFoundError, ErrorCode} from "../migration-error";
import {validateNoDuplicateIdentifier} from "../util";

export function validateNoDuplicateSuccessfulMigrationIdentifier (migrations : readonly SuccessfulMigration[]) : (
    | undefined
    | DuplicateSuccessfulMigrationIdentifierFoundError
) {
    return validateNoDuplicateIdentifier(migrations, ErrorCode.DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND);
}
