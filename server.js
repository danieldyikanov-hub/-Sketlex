const multer = require("multer");

const session = require("express-session");

const fs = require("fs");

const bcrypt = require("bcrypt");

const express = require("express");

const path = require("path");

const nodemailer = require("nodemailer");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "victorsketlex@gmail.com",
        pass: "phhk enzp weje dpot"
    }
});

transporter.verify((error, success) => {

    if (error) {
        console.log(error);
    } else {
        console.log("SMTP готов");
    }

});

const upload = multer({ storage });

const app = express();

app.use(session({
    secret: "sketlex-super-secret-key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, "public")));

const users = JSON.parse(
    fs.readFileSync("users.json")
);

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(
        u =>
        u.username === username
    );

    if (!user) {
        return res.send("Неверный логин или пароль");
    }
    
    const isMatch = await bcrypt.compare(
        password,
        user.password
    );
    if (!isMatch) {
        return res.send("Неверный логин или пароль");
    }

req.session.user = {
    username: user.username,
    role: user.role
};

    if (user.role === "admin") {
        return res.redirect("/admin");
}
    return res.redirect("/");
});

app.post("/register", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const email = req.body.email;

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        username: username,
        email: email,
        password: hashedPassword,
        role: "user"
    });
fs.writeFileSync(
    "users.json",
    JSON.stringify(users, null, 4)
);

    res.redirect("/");
});

app.get("/admin", (req, res) => {

    if (!req.session.user) {
        return res.send("Сначала войдите в систему");
    }

    if (req.session.user.role !== "admin") {
        return res.send("Доступ запрещен");
    }

    res.sendFile(
        path.join(__dirname, "private", "admin.html")
    );
});

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/");

    });

});

app.post("/forgotpassword", async (req, res) => {

    const email = req.body.email;

    const user = users.find(
        u => u.email === email
    );

    if (!user) {
        return res.send("Пользователь не найден");
    }

    const token = Date.now().toString();

    user.resetToken = token;

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 4)
    );

    const resetLink =
        `https://artist-sketlex.onrender.com/reset-password/${token}`;

await transporter.sendMail({

    from: "artist-sketlex@gmail.com",

    to: email,

    subject: "Восстановление пароля",

    html: `
        <h2>Восстановление пароля</h2>

        <a href="${resetLink}">
            Сменить пароль
        </a>
    `
});

    res.send ("Письмо отправлено");
});

app.get("/resetpassword/:token", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "resetpassword.html")
    );

});

app.post("/reset-password", async (req, res) => {

    const token =
    req.body.token;
    
    const password =
    req.body.password;

    const user = users.find(
        u => u.resetToken === token
    );

    if (!user) {
        return res.send("Ссылка недействительна");
    }

    user.password =
    await bcrypt.hash(password, 10);

    delete user.resetToken;

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 4)
    );

    res.send("Пароль успешно изменен");
});

app.post(
    "/upload-photo",
    upload.single("photo"),
    (req, res) => {

        res.send("Фото успешно загружено!");

    }
);

app.get("/photos", (req, res) => {

    if (!fs.existsSync("public/uploads")) {
        return res.json([]);
    }

    const files = fs.readdirSync("public/uploads");

    res.json(files);

});;

app.use(express.json());

function isAdmin(req) {
    return req.user && req.user.role === "admin";
}

app.post("/delete-photo", (req, res) => {

    if (
        !req.session.user ||
        req.session.user.role !== "admin"
    ) {
        return res.status(403).send("Нет доступа");
    }
    
    const fileName = req.body.file;

    const filePath = path.join(__dirname, "public/uploads", fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.send("Ошибка удаления");
        }

        res.send("Фото удалено");
    });
});

const songStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/songs");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const songUpload = multer({
    storage: songStorage
});

app.post(
    "/upload-song",
    songUpload.single("song"),
    (req, res) => {

        res.send("Песня загружена!");
    }
);

app.get("/songs", (req, res) => {

    if (!fs.existsSync("public/songs")) {
        return res.json([]);
    }

    const files = fs.readdirSync("public/songs");

    res.json(files);

});
app.post("/delete-song", (req, res) => {

    const fileName = req.body.file;

    const filePath = path.join(__dirname, "public/songs", fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.send("Ошибка удаления");
        }

        res.send("Песня удалена");
    });
});

app.get("/me", (req, res) => {

    if (!req.session.user) {
        return res.json({
            role: "guest"
        });
    }

    res.json({
        role: req.session.user.role,
        username: req.session.user.username
    });

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});