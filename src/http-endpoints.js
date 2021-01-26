'use strict';

const { client } = require('turbine');

// input data validation is not included for the sake of simplicity
async function addItemHandler(request, reply) {
    const { userId, itemId } = request.body;

    await client.call('cart/v1', 'addItem', { userId, itemId });
}

async function removeItemHandler(request, reply) {
    const { userId, itemId } = request.body;

    await client.call('cart/v1', 'removeItem', { userId, itemId });
}

async function checkoutHandler(request, reply) {
    const { userId } = request.body;

    await client.call('cart/v1', 'checkout', { userId });
}

exports = {
    addItemHandler,
    removeItemHandler,
    checkoutHandler
}
