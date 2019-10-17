import * as migrator from "../../../../../dist";
import * as tape from "tape";

tape(__filename, async (t) => {
    const normalized = migrator.MigrationErrorUtil.normalizeMigrationErrors();
    t.deepEqual(
        normalized,
        []
    );

    t.end();
});
