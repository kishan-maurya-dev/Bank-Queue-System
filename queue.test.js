const test = require("node:test");
const assert = require("node:assert/strict");
const { BankQueueSystem, CircularQueue } = require("./server");

test("circular queue wraps rear index and preserves FIFO order", () => {
    const queue = new CircularQueue(3, "Test Queue");

    assert.equal(queue.enqueue("A"), true);
    assert.equal(queue.enqueue("B"), true);
    assert.equal(queue.enqueue("C"), true);
    assert.equal(queue.dequeue(), "A");
    assert.equal(queue.enqueue("D"), true);

    assert.deepEqual(queue.toArray(), ["B", "C", "D"]);
    assert.equal(queue.snapshot().rear, 0);
});

test("bank system serves priority customers before regular customers", () => {
    const bank = new BankQueueSystem();
    bank.configure(5, 2);

    bank.addCustomer("Regular Customer", "regular");
    bank.addCustomer("Priority Customer", "priority");
    const result = bank.serveNext(1);

    assert.equal(result.ok, true);
    assert.equal(result.state.lastServed.name, "Priority Customer");
    assert.equal(result.state.stats.totalServed, 1);
});

test("bank system rejects overflow without changing queue size", () => {
    const bank = new BankQueueSystem();
    bank.configure(2, 1);

    bank.addCustomer("A", "regular");
    bank.addCustomer("B", "regular");
    const overflow = bank.addCustomer("C", "regular");

    assert.equal(overflow.ok, false);
    assert.equal(overflow.state.queues.regular.size, 2);
    assert.equal(overflow.state.stats.rejected, 1);
});
