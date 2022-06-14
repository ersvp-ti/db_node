const express = require('express')
const app = express()
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const newPort = process.env.PORT || 3000
// const handlebarsExp = require('express-handlebars')
const  Upload  = require('./models/db_up')
const bodyParse = require('body-parser')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

app.use(bodyParse.urlencoded({ extended: false }))
const urlEnconderParser = bodyParse.urlencoded({ extended: false })
const { sequelize } = require('./models/db')
app.use(bodyParse.json())

const Pagamento = require('./models/Pagamento')


app.engine('handlebars', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}))
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get("/", (request, response) => {
    response.render('home')
})

app.get('/pagamento', (request, response) => {
    Pagamento.findAll({ order: [['id', 'DESC']] }).then(function (pagamentos) {
        response.render('pagamento', { pagamentos: pagamentos })
    })
})

app.get('/cad-pagamento', (request, response) => {
    response.render('cad-pagamento')
})

app.post('/add-pagamento', (request, response) => {
    Pagamento.create({
        nome: request.body.nome,
        valor: request.body.valor
    }).then(() => {
        response.redirect('/pagamento')
    }).catch(() => {
        console.log('error do pagamento')
    })

})

app.get('/del-pagamento/:id', (request, response) => {
    Pagamento.destroy({
        where: {
            'id': request.params.id
        }
    }).then(() => {
        response.redirect('/pagamento')
        // response.send('Apagado com Sucesso!')
    }).catch(() => {
        response.send('Não apagou')
    })
})

//PUXA SOMENTE O ID DO USUARIO QUE FOI SOLICIDADO NO PAGAMENTO
app.get('/update/:id', (request, response) => {

    var id = request.params.id
    var query = `SELECT * FROM pagamentos WHERE id = "${id}"`

    sequelize.query(query)
        .then((resp) => {
            console.log(JSON.stringify(resp, null, 2))
            response.render('update', { updates: resp[0] })
        })
    // Pagamento.findAll({
    //     where: {
    //         id: request.params.id,
    //     }
    // }).then((resp) => {
    //     console.log(JSON.stringify(resp, null, 2))
    //     response.render('update', { updates: resp })
    // })

})
//REALIZA O UPDATE DO PAGAMENTO
app.post('/mensagem', urlEnconderParser, async (request, response) => {

    var nome = request.body.nome
    var valor = request.body.valor
    var id = request.body.id

    var query =
        `
    UPDATE pagamentos SET
    nome ="${nome}",
    valor = "${valor}"
    WHERE
    id = "${id}"
`

    sequelize.query(query)
        .then(() => {
            // console.log('Atualizado')
            response.render('mensagem')
        }).catch(() => {
            console.log('erro na atualização')
        })

    // await Pagamento.update()
})


//uploads

//OCULTAR O LOCAL DO UPLOADS
app.use('/files', express.static(path.resolve(__dirname, "./public")))


app.use(cors())
// app.use((req, res, next)=> {
//     res.header("Acess-Control-Allow-Origin", "*")
//     res.header("Acess-Control-Allow-Methods", "GET", "PUT", "POST", "DELETE")
//     // res.header("Acess-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization")

//     // next()

// })
//! Use of Multer
app.get('/post', (response, request) => {
    request.render('uploads')
})
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        // callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        callBack(null, file.originalname)
    }
})

var upload = multer({
    storage: storage
})

app.post("/profile", upload.single('imageUp'), async (req, res) => {

    if (!req.file) {
        console.log("Nenhum arquivo baixado!")
       
        
    } else {

       
        var imgsrc = process.env.PORT  ||  'http://localhost:3000/files/images/'

        await Upload.create({

            Imagens: imgsrc + req.file.filename,
            Name: req.file.filename,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
               
                res.redirect('/imagens-uploads-back')
               
                console.log('Enviado com sucesso, tudo Ok!')
            }).catch(() => {
                console.log('Error no banco - Não enviado!')
            })
    }

    // if (!req.file) {
    //     console.log("No file upload");
    // } else {
    //     console.log(req.file.filename)
    //     var imgsrc = 'http://localhost:8080/images/' + req.file.filename
    // var insertData = "INSERT INTO UserNew (id, Name) VALUES ([value-1],[value-2])"
    //     sequelize.query(insertData, [imgsrc], (err, result) => {
    //         if (err) throw err
    //         res.render('mansagem')
    //         console.log("file uploaded")
    //     })
    // }
});

app.get('/imagens-uploads', async (request, response) => {
    await Upload.findAll()

        .then((resp) => {
            // console.log(JSON.stringify(resp, null, 2))
            // response.render('imagens', { imagensUp: resp })
            return response.json({
                error: 'false',
                resp
            })

        }).catch((error) => {
            console.log('houve um error' + error)
        })
})
app.get('/imagens-uploads-back', async (request, response) => {
    await Upload.findAll()

        .then((user) => {
           
            response.render('imagens', { imagensUp: user })
          

        }).catch((error) => {
            console.log('houve um erro' + error)
        })
})


app.listen(newPort, () => {
    console.log('Server, Connected Success!!')
})