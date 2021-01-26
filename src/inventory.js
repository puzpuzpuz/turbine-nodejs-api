'use strict';

const { discovery } = require('turbine');

async function substract({ itemCount }, { itemId, count }) {
    const available = await itemCount.get(itemId);

    if (available < count) {
        // thrown exception will lead to transaction rollback
        new Error(`Insufficient amount for ${itemId} item`);
    }

    await itemCount.set(itemId, available - count);
}

async function price({ itemPrice }, { itemId }) {
    return itemPrice.get(itemId);
}

exports = (core) => {
    core.registerService('inventory/v1')
        .addFunction('substract', substract, {
            includeState: 'itemCount'
        })
        .addFunction('price', price, {
            includeState: 'itemPrice'
        })
        .done();
};
