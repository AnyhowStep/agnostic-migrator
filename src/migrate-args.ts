import {Migration} from "./migration";
import {StateStorage} from "./state-storage";

export interface MigrateArgs {
    /**
     * The order of `Migration`s is important.
     *
     * Migrations will be run from the beginning of the array, to the end.
     */
    readonly migrations : readonly Migration[];

    /**
     * Lets us persist our migration state onto some arbitrary storage.
     */
    readonly stateStorage : StateStorage;
}
