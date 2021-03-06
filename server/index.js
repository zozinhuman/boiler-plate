// 백엔드 시작점
const express = require('express')
const app = express()


const { User } = require("./models/User");
const { auth } = require("./middleware/auth");
const bodyParer = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err))

// application/x-www-form-urlencoded
app.use(bodyParer.urlencoded({ extended: true }));
// application/json
app.use(bodyParer.json());
app.use(cookieParser());

// register
app.post('/api/users/register', (req, res) => {
    // 회원가입 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터베이스에 넣어준다.
    const user = new User(req.body)
    user.save((err, userInfo) => { // mongoDB에서 오는 method : save
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ // 200은 성공했다는 의미
            success: true
        })
    })
})

// login
app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "입력한 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

            // 비밀번호가 같다면 Token을 생성한다.
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에? cookies, localstorage, session, .. 
                // 쿠키에 저장하기로 결정.
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// logout
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            logoutSuccess: true
        })
    })
})

// auth_route
app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 의미.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, // role이 1인 유저가 어드민, 0이 일반 유저
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/', (req, res) => res.send('Hello World! ~하이~~~'))

app.get('/api/hello', (req, res) => {
    res.send('Hello ~')
})

const port = 5000

app.listen(port, () => console.log(`Example app listening on port ${port}!`))