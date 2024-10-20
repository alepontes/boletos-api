import fastify from 'fastify';
import cors from '@fastify/cors';
import {PrismaClient} from '@prisma/client';

const server = fastify();
server.register(cors, {});

const prisma = new PrismaClient();

const dto = (invoice: any) => {
    return {
        id: invoice.id,
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

    const {distributor, clientId, year} = request.query as Partial<{
        distributor: string,
        clientId: string,
        year: string
    }>;

    const filters: Array<{ [key: string]: string | object }> = [];

    if (distributor) {
        filters.push({distributor: distributor})
    }

    if (clientId) {
        filters.push({clientId: clientId})
    }

    // @todo: melhorar implementação da estrutura de datas
    if (year) {
        filters.push({date: {contains: year}})
    }

    const invoices = await prisma.invoice.findMany({
        where: {AND: filters}
    });

    reply.send(invoices.map(invoice => dto(invoice)));

});


server.get('/filters', async () => {

    const invoices = await prisma.invoice.findMany({
        distinct: ['name', 'clientId', 'distributor', 'date'],
        select: {
            name: true,
            clientId: true,
            distributor: true,
            date: true,
        },
    });

    return invoices.reduce((acc: any, item: any) => {

        if (item.clientId && !acc.consumers.some((consumer: any) => consumer.id === item.clientId)) {
            acc.consumers.push({
                id: item.clientId,
                name: item.name,
            });
        }

        if (item.distributor && !acc.distributors.includes(item.distributor)) {
            acc.distributors.push(item.distributor);
        }

        const [, year] = item.date.split('/');

        if (year && !acc.years.includes(year)) {
            acc.years.push(year);
        }

        return acc;
    }, {consumers: [], distributors: [], years: []});
});


server.post('/invoices', async (request, reply) => {

    const data = request.body as any;

    const invoice = await prisma.invoice.create({
        data: {
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
            compensatedPriceUnit: data.compensatedEnergy.priceUnit,
            compensatedValue: data.compensatedEnergy.value,
            compensatedTax: data.compensatedEnergy.tax,
            publicEnergyValue: data.publicEnergy.value,
            totalValue: data.total.value,
        }
    });

    return dto(invoice);
});


server.get('/dashboard', async (request, reply) => {

    const sum = await prisma.invoice.aggregate({
        _sum: {
            electricalQuantity: true,
            sceeQuantity: true,
            compensatedQuantity: true,
            electricalValue: true,
            sceeValue: true,
            publicEnergyValue: true,
            compensatedValue: true,
        },
    });

    const {
        electricalQuantity,
        sceeQuantity,
        compensatedQuantity,
        electricalValue,
        sceeValue,
        publicEnergyValue,
        compensatedValue
    } = sum._sum as { [keu: string]: number };

    reply.send({
        energy: {
            total: electricalQuantity + sceeQuantity,
            compensated: compensatedQuantity,
        },
        financial: {
            total: electricalValue + sceeValue + publicEnergyValue,
            saving: compensatedValue,
        },
    });
});


server.listen({port: 8080}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})