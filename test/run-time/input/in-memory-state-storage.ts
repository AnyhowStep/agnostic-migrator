import * as migrator from "../../../dist";

export class InMemoryStateStorage implements migrator.StateStorage {
    private readonly successfulMigrations : migrator.SuccessfulMigration[] = [];
    private locked = false;

    setSuccessfulMigration = (successfulMigration : migrator.SuccessfulMigration) => {
        const index = this.successfulMigrations.findIndex(item => item.identifier == successfulMigration.identifier);
        if (index >= 0) {
            this.successfulMigrations[index] = successfulMigration;
        } else {
            this.successfulMigrations.push(successfulMigration);
        }
        return Promise.resolve();
    };
    fetchAllSuccessfulMigrations = () => {
        return Promise.resolve([...this.successfulMigrations]);
    };
    tryLock = () => {
        if (this.locked) {
            return Promise.resolve(false);
        } else {
            this.locked = true;
            return Promise.resolve(true);
        }
    };
    unlock = () => {
        if (this.locked) {
            this.locked = false;
            return Promise.resolve();
        } else {
            return Promise.reject(new Error(`Already unlocked`));
        }
    };
}
