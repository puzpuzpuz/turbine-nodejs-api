'use strict';

const { Turbine } = require('turbine');

const {
    addItemHandler,
    removeItemHandler,
    checkoutItemHandler
} = require('./http-endpoints');
const fastify = require('fastify')();

// Fastify (https://www.fastify.io) is used here for illustration purposes.
// Users can pick framework of their choice.

// register HTTP endpoints
fastify.post('/cart/add-item', addItemHandler);
fastify.post('/cart/remove-item', removeItemHandler);
fastify.post('/cart/checkout', checkoutItemHandler);

(async () => {
    try {
        const core = new Turbine();
        // register all services
        core.register(require('./cart'));
        core.register(require('./inventory'));
        core.register(require('./payment'));
        // start comms with Turbine
        await core.start();
        console.log('Turbine registration done');

        // now start HTTP server
        await new Promise((resolve, reject) => {
            fastify.listen(3000, (err, address) => {
                if (err) {
                    reject(err);
                }
                console.log(`HTTP server is listening on ${address}`);
                resolve();
            });
        });
    } catch (err) {
        console.error('Error occurred:', err);
        process.exit(1);
    }
})();
