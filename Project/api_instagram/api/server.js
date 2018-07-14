const express = require('express')
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const Objectid = require('mongodb').ObjectID
const multiparty = require('connect-multiparty')
const fs = require('fs')
const app = express()


//body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(multiparty());

app.listen(8080)

let db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
)


app.get('/', function (req, res) {
    res.send({ msg: 'Olá mundo' })
})

//post
app.post('/api', function (req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*')

    let date = new Date()
    time_stamp = date.getTime()

    let url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename


    let path_origem = req.files.arquivo.path;
    let path_destino = './uploads/' + url_imagem


    fs.rename(path_origem, path_destino, function (err) {
        if (err) {
            res.status(500).json({ error: err })
            return;
        }
    })

    let dados = {
        url_imagem: url_imagem,
        titulo: req.body.titulo
    }

    db.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.insert(dados, function (err, records) {
                if (err) {
                    res.json(err)
                } else {
                    res.json(records)
                }
                mongoClient.close();
            })
        })
    })
})


//get
app.get('/api', function (req, res) {
    db.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.json(err)
                } else {
                    res.json(results)
                }
                mongoClient.close()
            })
        })
    })
});


//get by id
app.get('/api/:id', function (req, res) {
    db.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.find(Objectid(req.params.id)).toArray(function (err, results) {
                if (err) {
                    res.json(err)
                } else {
                    res.json(results)
                }
                mongoClient.close()
            })
        })
    })
});


//put by id
app.put('/api/:id', function (req, res) {
    db.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.update(
                { _id: Objectid(req.params.id) },
                { $set: { titulo: req.body.titulo } },
                {},
                function (err, records) {
                    if (err) {
                        res.json(err)
                    } else {
                        res.json(records)
                    }
                }
            )
            mongoClient.close()
        })
    })
})


//delete by id
app.delete('/api/:id', function (req, res) {
    db.open(function (err, mongoClient) {
        mongoClient.collection('postagens', function (err, collection) {
            collection.remove({ _id: Objectid(req.params.id) }, function (err, records) {
                if (err) {
                    res.json(err)
                } else {
                    res.json(records)
                }
                mongoClient.close()
            })
        })
    })
})