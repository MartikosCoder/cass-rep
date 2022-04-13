const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { runWorker } = require("./src/objects/worker");
const { initContext, getPublicData, getProtectedData } = require('./src/objects/context');

const crypto = require('crypto');
const app = express();
const authTokens = {};

const { siteUser, sitePassword } = require('./src/consts/creds');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

const main = async () => {
// to support URL-encoded bodies
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
            res.redirect('/protected');
            return;
        } else {
            res.render('login', {
                message: 'Invalid username or password',
                messageClass: 'alert-danger'
            });
        }
    });

    const context = await initContext();

    app.get('/protected', (req, res) => {
        if (req.user) {
            res.render('protected', {data: getProtectedData(context), categories: context.categories.getCategories()});
        } else {
            res.render('login', {
                message: 'Please login to continue',
                messageClass: 'alert-danger'
            });
        }
    });

    app.post('/protected', (req, res) => {
        context.targets.makeEmptyTargets(context.branches.getBranches());
        const keys = Object.keys(req.body);
        for (const key of keys.filter(el => el.startsWith('sel_'))) {
            const parts = key.split('_');
            const cat = req.body[key];
            const n = parseInt(parts[2]) - 1;
            const surname = req.body[`surname_${parts[1]}_${parts[2]}`];
            const target1 = req.body[`target1_${parts[1]}_${parts[2]}`];
            const target2 = req.body[`target2_${parts[1]}_${parts[2]}`];
            if (target1 && target2) {
                context.targets.setDepartmentDishTarget(parts[1], n, cat, target1, target2, surname);
            }
        }
        const data = getProtectedData(context);
        const categories = context.categories.getCategories();
        res.render('protected', { data, categories });
    });

    runWorker(context, app);
    app.listen(3000);
}

main();