function isTokenValid(token) {
    return new Promise((resolve) => {
        if (token == 'C4NQDvFIk8L#^@z!UKUnxXFcCZ5qlt')
            resolve({
                valid: true,
                clientInformations: {
                    id: 1,
                    creationDate: Date.now(),
                    username: 'testusername',
                    email: 'example@email.de',
                },
            });
        else
            resolve({
                valid: false,
                clientInformations: {},
            });
    });
}

module.exports.isTokenValid = isTokenValid;
