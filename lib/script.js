/**
 * @param {org.acme.model.Create} _create
 * @transaction
 */

function create(create) {
    let to = create.to;

    return getAssetRegistry('org.acme.model.Coin')
        .then(function (assetRegistry) {
            var factory = getFactory();

            var coins = [];
            for (let index = 0; index < create.value; index++) {
                var coin = factory.newResource('org.acme.model', 'Coin', Date.now() + '' + index);
                coin.owner = to;
                coin.ownerId = to.memberId
                coins.push(coin);
                assetRegistry.add(coin);
            }

            return getParticipantRegistry('org.acme.model.Member')
                .then((toRegistry) => {
                    to.balance += create.value;
                    return toRegistry.update(to);
                });
        })
}

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

        coins = coins.filter((item) => {
            return item.ownerId == from.memberId;
        }).slice(0, transfer.value);

        coins = coins.map((coin) => {
            coin.owner = to;
            coin.ownerId = to.memberId;;
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