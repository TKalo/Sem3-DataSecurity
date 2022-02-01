const express = require("express");
const app = express();
const endpointFunctions = require("./endpoint-functions.js");

const accepted = 202;
const created = 201;
const ok = 200;
const notAcceptable = 406;

const read_tokens = process.env.READ_TOKENS.split(',')
const write_tokens = process.env.WRITE_TOKENS.split(',')
const all_tokens = read_tokens.join(write_tokens)

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json());

app.get("/", (req, res) => {
    res.status(ok).json(
        {
            'About': 'All endpoints will return ' + notAcceptable + ' if the given data results in a failure',
            'Endpoints': [
                {
                    '/user': {
                        'Method': 'GET',
                        'Description': 'Used to get the userid from the database from email.',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req body': {
                            'email': 'some@mail.com'
                        },
                        'Res': {
                            'status': ok,
                            'body': {
                                'userid': 'someUUID'
                            }
                        }
                    }
                },
                {
                    '/createUser': {
                        'Method': 'POST',
                        'Description': 'Used to insert an user into the database from email and password.',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req Body': {
                            'email': 'some@mail.com',
                            'password': 'secretPassWord!'
                        },
                        'Res': {
                            'status': created
                        }
                    }
                },
                {
                    '/updateUserEmail': {
                        'Method': 'PUT',
                        'Description': 'Used to update the email for a user. The old email is required to update.',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req Body': {
                            'old_email': 'some@mail.com',
                            'new_email': 'new@mail.com',
                        },
                        'Res': {
                            'status': ok
                        }
                    }
                },
                {
                    '/updateUserPassword': {
                        'Method': 'PUT',
                        'Description': 'Used to update the password for a user. This requires the users email for identification.',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req Body': {
                            'email': 'some@mail.com',
                            'new_password': 'new@mail.com',
                        },
                        'Res': {
                            'status': ok
                        }
                    }
                },
                {
                    '/deleteUser': {
                        'Method': 'DELETE',
                        'Description': 'Used to delete an user from the database from email.',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req Body': {
                            'email': 'some@mail.com'
                        },
                        'Res': {

                            'status': ok

                        }
                    }
                },
                {
                    '/login': {
                        'Method': 'GET',
                        'Description': 'Used to authenticate an user from user credentials (email and password).',
                        'req header': {
                            'Autorization': 'given token'
                        },
                        'Req Body': {
                            'email': 'some@mail.com',
                            'password': 'someValidP@ssword123'
                        },
                        'Res': {
                            'status': accepted
                        }
                    }
                },
            ]
        });
});


app.get("/user",(req, res)=>{
    if(!checkValidToken(req, res,all_tokens)) return

    endpointFunctions.getUser(req.body.email).then(function (resultObject) {
        res.status(resultObject.success ? ok : notAcceptable).json(resultObject.success ? {'userid' : resultObject.result.get('userid') } : {'error' : resultObject.error});
    });
});

app.post("/createUser",(req, res)=>{
    if(!checkValidToken(req, res,write_tokens)) return

    endpointFunctions.addUser(req.body.email,req.body.password).then(function (resultObject){
        res.status(resultObject.success ? created : notAcceptable).json(resultObject.success ? {} : {'error' : resultObject.error});
    });
});

app.delete("/deleteUser",(req, res)=>{
    if(!checkValidToken(req, res,write_tokens)) return

    endpointFunctions.deleteUser(req.body.email).then(function (resultObject){
        res.status(resultObject.success ? ok : notAcceptable).json(resultObject.success ? {} : {'error' : resultObject.error});
    });
});

app.get("/login",(req, res)=>{
    if(!checkValidToken(req, res, all_tokens)) return

    endpointFunctions.authenticateUser(req.body.email,req.body.password).then(function(resultObject){
        res.status(resultObject.success ? accepted : notAcceptable).json(resultObject.success ? {} : {'error' : resultObject.error});
    });
});

app.put("/updateUserEmail", (req, res)=>{
    if(!checkValidToken(req, res,write_tokens)) return

    endpointFunctions.updateUserEmail(req.body.old_email, req.body.new_email).then(function(resultObject){
        res.status(resultObject.success ? ok : notAcceptable).json(resultObject.success ? {} : {'error' : resultObject.error});
    });

});

app.put("/updateUserPassword", (req, res) =>{
    if(!checkValidToken(req, res,write_tokens)) return

    endpointFunctions.updateUserPassword(req.body.email, req.body.new_password).then(function(resultObject){
        res.status(resultObject.success ? ok : notAcceptable).json(resultObject.success ? {} : {'error' : resultObject.error});
    });

});

function checkValidToken(req, res, tokens){
    header = req.header('Authorization')
    if(header != null) {

        if(tokens.includes(header)) return true;

        else res.status(notAcceptable).json({'error' : 'the provided token is not valid'})

    }else res.status(notAcceptable).json({'error' : 'a token must be provided, header = ' + header})

    return false;
}