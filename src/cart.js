'use strict';

// TODO how do we specify the key (partition id) when calling services?

// the function has to have the expected signature
async function addItem(
    { // state-related objects:
        cart // IMap-like object
    },
    { // invocation arguments:
        userId,
        itemId
    }
) {
    let itemIds = await cart.get(userId);

    if (itemIds === null) {
        itemIds = [];
    }
    itemIds.push(itemId);

    await itemCount.set(userId, itemIds);
}

async function removeItem({ cart }, { userId, itemId }) {
    const itemIds = await cart.get(userId);

    if (itemIds === null) {
        return;
    }

    const idx = itemIds.indexOf(itemId);
    if (idx === -1) {
        return;
    }
    itemIds.splice(idx);

    await itemCount.set(userId, itemIds);
}

async function checkout(
    { cart, inventoryService, paymentService },
    { userId }
) {
    const itemIds = await cart.get(userId);

    // note: we use number type here for the sake of simplicity (should be bigint-based)
    let totalPrice = 0;
    for (const itemId of itemIds) {
        await inventoryService.substract({ itemId, count: 1 });
        // alternative approach (simpler to implement)
        // await inventoryService.call('substract', { itemId, count: 1 });
        totalPrice += await inventoryService.price({ itemId });
    }

    await paymentService.pay({ userId, amount: totalPrice });
}

exports = (core) => {
    core
        // service name
        // alternative approach to versioning: .version(1)
        .registerService('cart/v1')
        // registered function assumes req/res comm pattern
        // (we may support other patterns, like pub/sub)
        .addFunction('addItem', addItem, {
            // state proxies will be injected during invocation
            includeState: 'cart'
        })
        .addFunction('removeItem', removeItem, {
            includeState: 'cart'
        })
        .addFunction('checkout', checkout, {
            includeState: 'cart',
            // service proxies will be injected during invocation
            includeService: [
                {
                    name: 'inventory/v1',
                    alias: 'inventoryService'
                },
                {
                    name: 'payment/v1',
                    alias: 'paymentService'
                }
            ],
            // start new trasaction on each invocation
            transactional: true
        })
        .done();
};
