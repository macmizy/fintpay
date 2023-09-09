const bcrypt = require("bcrypt")
    
async function hash (payload) {
    const hash =  await bcrypt.hash(payload, 10);
    return  hash;
        
}

async function unhash (payload, hashed) {
    const compare = await bcrypt.compare(payload, hashed);
    return compare;
}

module.exports = {
    hash,
    unhash
}


