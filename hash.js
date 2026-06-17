const bcrypt = require("bcrypt");

bcrypt.hash("Kuka251202", 10)
.then(hash => {
    console.log(hash);
});