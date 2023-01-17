import { performance } from "perf_hooks";
import { v4 as uuidv4 } from "uuid";

namespace TaskItems {
    type Item<TKey> = typeof Items.Item.prototype;

    export class Items<TKey> {
        static Item = class <TKey> {
            public readonly id: TKey;
            public updatedAt: number;
            public isDeleted: boolean = false;

            constructor(public initId: TKey, public initUpdatedAt: number) {
                this.id = initId;
                this.updatedAt = initUpdatedAt;
            }
        };

        private time: number = 0;
        public now(): number {
            return this.time++;
        }

        private readonly items: Item<TKey>[] = [];

        public add(id: TKey) {
            let item = this.items.find((i) => i.id === id);
            if (item != null)
                throw new Error("Element with key " + id + " was already added");

            this.items.push(new Items.Item(id, this.now()));
        }

        public update(id: TKey) {
            let item = this.items.find((i) => i.id === id);
            if (item == null)
                throw new Error("Element with key " + id + " was not found");

            if (item.isDeleted) {
                item.isDeleted = false;
                item.updatedAt = this.now();
            }
        }

        public delete(id: TKey) {
            let item = this.items.find((i) => i.id === id);
            if (item == null)
                throw new Error("Element with key " + id + " was not found");

            if (!item.isDeleted) {
                item.isDeleted = true;
                item.updatedAt = this.now();
            }
        }

        public getActiveItems(): TKey[] {
            return this.items
                .filter((e, _i, _a) => !e.isDeleted)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((e, _i, _a) => e.id);
        }

        public getDeletedItems(): TKey[] {
            return this.items
                .filter((e, _i, _a) => e.isDeleted)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((e, _i, _a) => e.id);
        }

        public setActiveItems(_ids: TKey[]) {
            throw new Error("Method Items.SetActiveItems is not implemented, you must implement it first");
        }
    }
}

class Test {
    public static main() {
        try {
            let items = new TaskItems.Items<number>();
            items.add(0);
            items.add(1);
            items.add(2);
            items.delete(2);
            items.add(3);
            items.delete(3);

            items.setActiveItems([1, 2, 4]);

            items.add(5);

            let expected = [5, 4, 2, 1];
            let actual = items.getActiveItems();
            if (!expected.every((e, i, _a) => e === actual[i])) {
                throw new Error("Incorrect answer. Expected: " + expected.join() + " Was: " + actual.join());
            }

            expected = [3, 0];
            actual = items.getDeletedItems();
            if (!expected.every((e, i, _a) => e === actual[i])) {
                throw new Error("Incorrect answer. Expected: " + expected.join() + " Was: " + actual.join());
            }

            let items2 = new TaskItems.Items<number>();
            for (var i = 0; i < 10000; i++) {
                items2.add(i);
            }

            let arr: number[] = [];
            for (let i = 5000; i <= 15000; i++) {
                arr.push(i);
            }

            let randomizedArray = [...arr].sort(() => uuidv4().localeCompare(uuidv4()));

            let start = performance.now();

            items2.setActiveItems(randomizedArray);

            let end = performance.now();

            let result = items2.getActiveItems().sort((a, b) => a - b);
            if (!arr.every((e, i, _a) => e === result[i])) {
                throw new Error("Incorrect answer.");
            }

            if (end - start > 100) {
                throw new Error("Task is not solved optimally");
            }

            console.log("Task solved");
        } catch (e: unknown) {
            console.log("Task not solved: " + (e as Error).message);
        }
    }
}

Test.main();
