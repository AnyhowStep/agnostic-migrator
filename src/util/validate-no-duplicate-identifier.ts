import {ErrorCode} from "../migration-error";

export function validateNoDuplicateIdentifier<
    ErrorCodeT extends (
        | ErrorCode.DUPLICATE_MIGRATION_IDENTIFIER_FOUND
        | ErrorCode.DUPLICATE_SUCCESSFUL_MIGRATION_IDENTIFIER_FOUND
    )
> (
    arr : readonly { identifier : string }[],
    errorCode : ErrorCodeT
) : (
    | undefined
    | {
        errorCode : ErrorCodeT,
        duplicates : string[],
    }
) {
    const {duplicates} = arr.reduce<{
        seen : string[],
        duplicates : string[],
    }>(
        (memo, migration) => {
            if (memo.seen.includes(migration.identifier)) {
                if (!memo.duplicates.includes(migration.identifier)) {
                    memo.duplicates.push(migration.identifier);
                }
                return memo;
            } else {
                memo.seen.push(migration.identifier);
                return memo;
            }
        },
        {
            seen : [],
            duplicates : [],
        }
    );
    if (duplicates.length == 0) {
        return undefined;
    } else {
        return {
            errorCode,
            duplicates,
        };
    }
}
