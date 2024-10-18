import fastify from 'fastify';
import cors from '@fastify/cors';

const server = fastify();
server.register(cors, {});

server.get('/hello', async (request, reply) => {
    return 'world';
})

server.get('/invoices', async () => {

    // mock
    return [
        {
            nomeUC: "CASA DONA COMERCIO VAREJISTA E SOLUÇÕES",
            numeroUC: "3002863513",
            distribuidora: "CEMIG",
            consumidor: "CASA DONA COMERCIO VAR...",
        },
        {
            nomeUC: "Walter Boaventura da Silva",
            numeroUC: "3003336712",
            distribuidora: "CEMIG",
            consumidor: "Walter Boaventura da Silva",
        },
    ]

});

server.get('/filters', async () => {

    // mock
    return {
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024]
    }

});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})