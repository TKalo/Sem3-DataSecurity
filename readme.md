Tilgå: http://t11-api:7000/ENDPOINT
eksempel:
curl -X POST http://t11-api:7000/createUser -H 'Content-Type: application/json' -H 'authorization: [TOKEN_HERE]'  -d '{"email":"test@test.dk", "password":"tEstpass12341!"}'


Deploy:
- Deploy cassandra/service.yml først
- Deploy derefter cassandra/deploy-cass.yml
- Deploy NodeJS/deployment.yaml
