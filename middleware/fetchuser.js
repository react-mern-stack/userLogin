const jwt = require('jsonwebtoken');
const JWT_SECRET = 'goodboy';

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
   if(!token){
            res.status(400).json({ error: "Invalid credentials" })
}
try{
const data = jwt.verify(token, JWT_SECRET)
req.user=data.user;
next();
} catch{
     res.status(400).json({ error: "Invalid credentials" })
}
}
module.exports = fetchuser