import {MigrationError} from "../migration-error";

/**
 * Removes all `undefined` values from the array of `errors`
 */
export function normalizeMigrationErrors<ArrT extends readonly (MigrationError|undefined)[]> (
    ...errors : ArrT
) : readonly Exclude<ArrT[number], undefined>[] {
    return errors.filter(
        (err : ArrT[number]) : err is Exclude<ArrT[number], undefined> => {
            return err != undefined;
        }
    );
}
