const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const getTime = () => {
    return Math.trunc(Date.now() / 1000);
};

const cors = require('cors')({origin: true});

const messages = {
    serverError: '잠시후 다시 시도해주세요.'
}

/** createAuction
 * @params userId
 * @params tokenId
 * @params title
 * @params description
 * @params price
 * @params due
 */
exports.createAuction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        const { userId, tokenId, title, description, price, due } = req.body;
        
        const auctionId = admin.database().ref().child('auctions').push().key;
    
        let updates = {};
    
        //add auction
        updates[`auctions/${auctionId}`] = {
            userId: userId,
            tokenId: tokenId,
            title:title,
            description: description,
            price: price,
            due: due,
            createdAt:getTime()
        };
    
        //add auction to user
        updates[`users/${userId}/auctions/${auctionId}`] = {
            user: userId,
            tokenId: tokenId,
        };
    
        let dbRef = admin.database().ref();
        dbRef.update(updates, error => {
            if (error) res.send({result: false, message: messages.serverError});
            else res.send({ result: true, auctionId: auctionId });
        });
    })
});


/** getAuctionList
 * @params skip
 * @params limit
 */
exports.getAuctionList = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        let skip = req.body.skip || 0;
        let limit = req.body.limit || 25;

        let ref = admin.database().ref(`auctions`);
        ref.once('value').then(snap => {
            let val = snap.val();
            if (val) return res.send({ result: true, data: val });
            else return res.send({result: false, message: messages.serverError});
        }).catch((e) => {
            res.sendStatus(404);
        })
    });
});


// bid

// winner takes it all

