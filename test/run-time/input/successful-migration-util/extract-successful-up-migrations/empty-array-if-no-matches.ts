import * as migrator from "../../../../../dist";
import * as tape from "tape";

tape(__filename, async (t) => {
    const result = await migrator.SuccessfulMigrationUtil.extractSuccessfulUpMigrations(
        [
            /**
             * This is a successful down migration
             */
            {
                identifier : "1",
                migratedUp : false,
                timestamp : 9999,
                batchNumber : 1337,
            },
            /**
             * This is a successful down migration
             */
            {
                identifier : "3",
                migratedUp : false,
                timestamp : 9999,
                batchNumber : 1338,
            },
        ]
    );
    t.deepEqual(
        result,
        []
    );

    t.end();
});
