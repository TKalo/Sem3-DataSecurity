const server = require('./endpoint-functions.js')
const encryption = require('./encryption')

afterAll(() => {
    server.closeDB();
})

describe('testing validators', () => {
    test('test password checker', () => {
        const passLessThan12 = "abcdij.!@22"
        const passWithoutReqChar = "sothvlemspro";
        const passAcceptable = "defghij.!@22"

        expect(server.checkPassword(passLessThan12) == null).toBe(false);

        expect(server.checkPassword(passWithoutReqChar) == null).toBe(false);

        expect(server.checkPassword(passAcceptable) == null).toBe(true);
    })

    test('test email checker', () =>{
        const acceptableEmails = [
            'email@example.com',
            'firstname.lastname@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            'email@123.123.123.123.com',
            '\"email\"@example.com',
            '1234567890@example.com',
            'email@example-one.com',
            '_______@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.co.jp'
        ]

        const unAcceptableEmails = [
            'plainaddress',
            '#@%^%#$@#$@#.com',
            '@example.com',
            'Joe Smith <email@example.com>',
            'email.example.com',
            'email@example@example.com',
            '.email@example.com',
            'email.@example.com',
            'email..email@example.com',
            'あいうえお@example.com',
            'email@example.com (Joe Smith)',
            'email@example',
            'email@-example.com',
            'email@example..com',
            'Abc..123@example.com',
            'List of Strange Invalid Email Addresses',
            '”(),:;<>[\\]@example.com',
            'just”not”right@example.com',
            'this\ is"really"not\allowed@example.com',
        ]

        acceptableEmails.forEach(email => {
            try{
                expect(server.checkEmail(email)).toBe(true);
            }catch(err){
                err.message = `${err.message}\n\nfailing email: ${email}`;
                throw err;
            }
        });

        unAcceptableEmails.forEach(email => {
            try{
                expect(server.checkEmail(email)).toBe(false);
            }catch(err){
                err.message = `${err.message}\n\npassing email: ${email}`;
                throw err;
            }
        });
    })
});

describe('testing encryption', () => {
    test('encrypt', () => {
        original_value = 'this is a long string'
        encrypted_value = encryption.encrypt(original_value)
        expect(encrypted_value).toBe("6213294819466d5a372df3e384ea3f3292fd601143")
        expect(encryption.decrypt(encrypted_value)).toBe(original_value)
    })
})


describe('database interaction test', () => {
    let usableEmail = "email@example.com";
    let usablePassword = "abcdefghij.!@2";
    let newUsableEmail = "email@example1.com";
    let newUsablePassword = "123456789abcqq!";
    let unUsableEmail = "plainaddress";
    let unUsablePassword = "abcdij.!@22";


    test('add user with unusable email', async () => {expect((await server.addUser(unUsableEmail,usablePassword)).success).toBe(false)});

    test('add user with unusable password', async () => {expect((await server.addUser(usableEmail,unUsablePassword)).success).toBe(false)});

    test('add user with usable values', async () => {expect((await server.addUser(usableEmail,usablePassword)).success).toBe(true)});

    test('add existing user', async () => {expect((await server.addUser(usableEmail, newUsablePassword)).success).toBe(false)});

    test('correct authentication', async () => {expect((await server.authenticateUser(usableEmail, usablePassword)).success).toBe(true)});

    test('false email authentication', async () => {expect((await server.authenticateUser(newUsableEmail, usablePassword)).success).toBe(false)});

    test('false password authentication', async () => {expect((await server.authenticateUser(usableEmail, newUsablePassword)).success).toBe(false)});

    test('get existing user', async () => {expect((await server.getUser(usableEmail)).success).toBe(true)});

    test('get non-existing user', async () => {expect((await server.getUser(newUsableEmail)).success).toBe(false)});

    test('update non-existing user email', async () => {expect((await server.updateUserEmail(newUsableEmail, newUsableEmail)).success).toBe(false)});

    test('update non-existing user password', async () => {expect((await server.updateUserPassword(newUsableEmail, newUsablePassword)).success).toBe(false)});

    test('update existing user with unusable Email', async () => {expect((await server.updateUserEmail(usableEmail, unUsableEmail)).success).toBe(false)});

    test('update existing user with unusable password', async () => {expect((await server.updateUserPassword(usableEmail, unUsablePassword)).success).toBe(false)});

    test('update existing user with usable email', async () => {expect((await server.updateUserEmail(usableEmail, newUsableEmail)).success).toBe(true)});

    test('update existing user with usable password', async () => {expect((await server.updateUserPassword(newUsableEmail, newUsablePassword)).success).toBe(true)});

    test('delete non-existing user', async () => {expect((await server.deleteUser(usableEmail)).success).toBe(false)});

    test('delete existing user', async () => {expect((await server.deleteUser(newUsableEmail)).success).toBe(true)});
})