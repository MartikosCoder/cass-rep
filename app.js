const express = require('express');
const exphbs = require('express-handlebars')
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { runWorker, syncData, updateLinks } = require("./src/objects/worker");
const { initContext, getPublicData, getProtectedData } = require('./src/objects/context');

const crypto = require('crypto');
const app = express();
const authTokens = {};

app.use(express.static(__dirname));

const { siteUser, sitePassword } = require('./src/consts/creds');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

const main = async () => {
    const context = await initContext();
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cookieParser());

    app.use((req, res, next) => {
        const authToken = req.cookies['AuthToken'];
        req.user = authTokens[authToken];
        next();
    });

    app.engine('hbs', exphbs({
        extname: '.hbs'
    }));

    app.set('view engine', 'hbs');

    app.get('/', (req, res) => {
        res.render('home');
    });

    app.get('/main', async (req, res) => {
        if (req.user) {
            res.render('main', { data: context.connected });
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/settings', async (req, res) => {
        if (req.user) {
            if (!context.inProcess) res.render('settings', { data: context.iiko.getAuthData() })
            else {
                res.send('<script>alert("Дождитесь окончания процесса синхронизации"); window.location.href = "/main"; </script>');
            }
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.post('/settings', async (req, res) => {
        const { server, user, password } = req.body;
        context.iiko.update(server, user, password);
        const syncResult = await syncData(context, app);
        if (syncResult) {
            res.render('main', {
                message: 'Соединение с сервером установлено',
                messageClass: 'alert-success'
            });
        } else {
            res.render('main', {
                message: 'Соединение с сервером не установлено!',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.post('/login', (req, res) => {
        const {user, password} = req.body;
        const hashedPassword = getHashedPassword(password);

        if (user === siteUser && hashedPassword === sitePassword) {
            const authToken = generateAuthToken();

            authTokens[authToken] = user;

            res.cookie('AuthToken', authToken);
            res.redirect('/main');
        } else {
            res.render('login', {
                message: 'Invalid username or password',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/protected', (req, res) => {
        if (req.user) {
            if (context.connected) res.render('protected', {
                data: getProtectedData(context),
                categories: context.categories.getCategories(),
                filters: context.filters.getFilters()
            });
            else res.send('<script>alert("Дождитесь окончания процесса синхронизации"); window.location.href = "/main"; </script>');
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/report', (req, res) => {
        if (req.user) {
            if (context.connected) {
                const data = context.branches.getBranches();
                res.render('report', {data});
            } else res.send('<script>alert("Дождитесь окончания процесса синхронизации"); window.location.href = "/main"; </script>');
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/links', (req, res) => {
        if (req.user) {
            if (context.connected) {
                updateLinks(context, app);
                const data = context.links.getLinks();
                res.render('links', {data});
            } else res.send('<script>alert("Дождитесь окончания процесса синхронизации"); window.location.href = "/main"; </script>');
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.get('/sync', async (req, res) => {
        if (!context.inProcess) {
            const syncResult = await syncData(context, app);
            if (syncResult) {
                res.render('main', {
                    message: 'Синхронизация выполнена успешно',
                    messageClass: 'alert-success'
                });
            } else {
                res.render('main', {
                    message: 'Синхронизация не выполнена',
                    messageClass: 'alert-danger'
                });
            }
        } else res.send('<script>alert("Дождитесь окончания процесса синхронизации"); window.location.href = "/main"; </script>');
    });

    app.post('/report', async (req, res) => {
        const { startDate, endDate, department } = req.body;
        if (startDate && endDate && startDate > endDate) {
            res.render('/report', {
                data: context.branches.getBranches(),
                message: 'Неправильно задан диапазон дат для отчета',
                messageClass: 'alert-danger'
            });
        } else {
            const data = await getPublicData(context, department, startDate, endDate);
            res.render('publicTable', { data });
        }
    });

    app.post('/protected', (req, res) => {
        const template = [];
        for (let i = 1; i < 6; i++) {
            template.push({
                dish: req.body[`sel_${i}`],
                surname: req.body[`surname_${i}`],
                target1: parseInt(req.body[`target1_${i}`]),
                target2: parseInt(req.body[`target2_${i}`])
            });
        }

        context.targets.makeEmptyTargets(context.branches.getBranches(), template);
        context.filters.update(req.body["pay"], req.body["disc"], req.body["ord"]);
        const obj = {
            filters: context.filters.filters,
            targets: context.targets.allTargets
        }
        fs.writeFileSync('options.conf', JSON.stringify(obj));
        res.render('protected', {data: getProtectedData(context), categories: context.categories.getCategories(),
                filters: context.filters.getFilters()});
    });

    runWorker(context, app);
    app.listen(3000);
    console.log('server started on 3000');
}

main();