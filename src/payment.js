'use strict';

// TODO can we guarantee transactionality if we call
// a 3rd-party service instead of mutating IMap here?
async function pay({ accounts }, { userId, amount }) {
    const funds = await accounts.get(userId);

    if (funds < amount) {
        // thrown exception will lead to transaction rollback
        new Error(`Insufficient funds for ${userId} user`);
    }

    await accounts.set(userId, funds - amount);
}

async function refund({ accounts }, { userId, amount }) {
    const funds = await accounts.get(userId);

    await accounts.set(userId, funds + amount);
}

exports = (core) => {
    core.registerService('payment/v1')
        .addFunction('pay', pay, {
            includeState: 'accounts'
        })
        .addFunction('refund', refund, {
            includeState: 'accounts'
        })
        .done();
};
