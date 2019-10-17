import * as migrator from "../../../../../dist";
import * as tape from "tape";

tape(__filename, async (t) => {
    const result = await migrator.SuccessfulMigrationUtil.extractSuccessfulUpMigrations(
        [
            {
                identifier : "0",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1337,
            },
            /**
             * This is a successful down migration
             */
            {
                identifier : "1",
                migratedUp : false,
                timestamp : 9999,
                batchNumber : 1337,
            },
            {
                identifier : "2",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1336,
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
            {
                identifier : "4",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1337,
            },
        ]
    );
    t.deepEqual(
        result,
        [
            {
                identifier : "0",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1337,
            },
            {
                identifier : "2",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1336,
            },
            {
                identifier : "4",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1337,
            },
        ]
    );

    t.end();
});
