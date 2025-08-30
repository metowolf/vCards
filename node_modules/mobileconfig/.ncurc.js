module.exports = {
    upgrade: true,
    reject: [
        // jsrsasign 10.x is not compatible of current usage
        'jsrsasign'
    ]
};
