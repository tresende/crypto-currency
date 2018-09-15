/**
 * @param {org.acme.model.Transfer} _transfer
 * @transaction
 */

function transfer(transfer) {

    let coinRegistry = {};
    let from = transfer.from;
    let to = transfer.to;

    if (from.balance < transfer.value) {
        throw new Error('Insufficient Funds');
    }

    return getAssetRegistry('org.acme.model.Coin').then((assetRegistry) => {
        coinRegistry = assetRegistry;
        return assetRegistry.getAll();
    }).then((coins) => {

        coins = coins.map((coin) => {
            coin.owner = to;
            coinRegistry.update(coin);
        });

        return getParticipantRegistry('org.acme.model.Member')
            .then((fromRegistry) => {
                from.balance -= transfer.value;
                fromRegistry.update(from);
                return getParticipantRegistry('org.acme.model.Member')
                    .then((toRegistry) => {
                        to.balance += transfer.value;
                        return toRegistry.update(to);
                    });
            });
    })
}