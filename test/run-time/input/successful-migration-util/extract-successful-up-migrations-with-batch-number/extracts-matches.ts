import * as migrator from "../../../../../dist";
import * as tape from "tape";

tape(__filename, async (t) => {
    const result = await migrator.SuccessfulMigrationUtil.extractSuccessfulUpMigrationsWithBatchNumber(
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
            /**
             * This has a different batch number
             */
            {
                identifier : "2",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1336,
            },
            /**
             * This is both a successful down migration and has a different batch number
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
        ],
        1337
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
                identifier : "4",
                migratedUp : true,
                timestamp : 9999,
                batchNumber : 1337,
            },
        ]
    );

    t.end();
});
