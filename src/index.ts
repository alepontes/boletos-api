import fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client'

const server = fastify();
server.register(cors, {});

const prisma = new PrismaClient();

const dto = (invoice: any) => {
    return {
        personal: {
            clientId: invoice.clientId,
            name: invoice.name,
            meterId: invoice.meterId
        },
        general: {
            date: invoice.date,
            due: invoice.due,
            payment: invoice.payment,
            distributor: invoice.distributor,
        },
        electricalEnergy: {
            quantity: invoice.electricalQuantity,
            priceUnit: invoice.electricalPriceUnit,
            value: invoice.electricalValue,
            tax: invoice.electricalTax
        },
        scee: {
            quantity: invoice.sceeQuantity,
            priceUnit: invoice.sceePriceUnit,
            value: invoice.sceeValue,
            tax: invoice.sceeTax
        },
        compensatedEnergy: {
            quantity: invoice.compensatedQuantity,
            priceUnit: invoice.compensatedPriceUnit,
            value: invoice.compensatedValue,
            tax: invoice.compensatedTax
        },
        publicEnergy: {
            value: invoice.publicEnergyValue
        },
        total: {
            value: invoice.totalValue
        }
    }
}

server.get('/invoices', async (request, reply) => {

    const invoices = await prisma.invoice.findMany();

    console.log('invoices');
    console.log(invoices);

    reply.send(invoices.map(invoice => dto(invoice)));

});

server.get('/filters', async () => {

    // mock
    return {
        years: [2018, 2019, 2020, 2021, 2022, 2023, 2024]
    }

});

server.post('/invoices', async (request, reply) => {

    const data = request.body as any;

    const invoice = await prisma.invoice.create({ data: {
            clientId: data.personal.clientId,
            name: data.personal.name,
            meterId: data.personal.meterId,
            date: data.general.date,
            due: data.general.due,
            payment: data.general.payment,
            distributor: data.general.distributor,
            electricalQuantity: data.electricalEnergy.quantity,
            electricalPriceUnit: data.electricalEnergy.priceUnit,
            electricalValue: data.electricalEnergy.value,
            electricalTax: data.electricalEnergy.tax,
            sceeQuantity: data.scee.quantity,
            sceePriceUnit: data.scee.priceUnit,
            sceeValue: data.scee.value,
            sceeTax: data.scee.tax,
            compensatedQuantity: data.compensatedEnergy.quantity,
            compensatedPriceUnit:data.compensatedEnergy.priceUnit,
            compensatedValue:data.compensatedEnergy.value,
            compensatedTax: data.compensatedEnergy.tax,
            publicEnergyValue: data.publicEnergy.value,
            totalValue: data.total.value,
        } });

    return dto(invoice);
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})