// @ts-ignore
import pdf from 'pdf-parse';
import fs from 'fs';


const parse = (value: string) => {
    const formattedValue = value
        .replace(/\./g, '')
        .replace(',', '.');

    return parseFloat(formattedValue);
}

/**
 * Converte um PDF em Texto
 */
const pdftoText = async (_buffer: any) => {
    return new Promise((resolve, reject) => {
        pdf(_buffer).then(({text}: { text: string }) => {
            resolve(text);
        });
    });
}

/**
 *
 */
const extractPersonalInformation = (text: string) => {
    const regex = new RegExp(/\s+Nº DO CLIENTE\s+Nº DA INSTALAÇÃO\s+(\d+)\s+(\d+)/, 'g');
    const [, clientId, meterId] = regex.exec(text) || [];

    return {
        clientId,
        meterId,
    }
}

/**
 *
 * @param text
 * @returns {Promise<void>}
 */
const extractGeneralInformation = (text: string) => {
    const regex = new RegExp(/\s+Referente a\s+Vencimento\s+Valor a pagar \(R\$\)\s+([A-Z]{3}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+(,\d+)?)/, 'g');
    const [, date, due, payment] = regex.exec(text) || [];

    return {
        date,
        due,
        payment: parse(payment),
    }

}

/**
 *
 * @param text
 * @returns {{priceUnit: string, quantity: string, tax: string, value: string}}
 */
const extractElectricalEnergyInformation = (text: string) => {
    const regex = new RegExp(/Energia ElétricakWh\s+(\d+)\s+(\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(\d+(?:,\d+)?)/, 'g');
    const [, quantity, priceUnit, value, tax] = regex.exec(text) || [];

    return {
        quantity: parse(quantity),
        priceUnit: parse(priceUnit),
        value: parse(value),
        tax: parse(tax),
    }

}

const extractSceeInformation = (text: string) => {
    const regex1 = new RegExp(/Energia SCEE s\/ ICMSkWh\s+(\d+)\s+(\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(\d+(?:,\d+)?)/, 'g');
    const regex2 = new RegExp(/Energia SCEE s\/ ICMSkWh\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:,\d+)?)\s+(\d{1,3}(?:\.\d{3})*),(\d{2})\s+(-?\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)/, 'g');

    const result1 = regex1.exec(text);
    if (result1) {
        const [, quantity, priceUnit, value, tax] = result1;

        return {
            quantity: parse(quantity),
            priceUnit: parse(priceUnit),
            value: parse(value),
            tax: parse(tax),
        }
    }

    const result2 = regex2.exec(text);
    if (result2) {
        const [, quantity, priceUnit, value, , , , , , tax] = result2;

        return {
            quantity: parse(quantity),
            priceUnit: parse(priceUnit),
            value: parse(value),
            tax: parse(tax),
        }
    }

}

const extractCompensatedEnergyInformation = (text: string) => {
    const regex1 = new RegExp(/Energia compensada GD IkWh\s+(\d+)\s+(\d+(?:,\d+)?)\s+(-?\d+(?:,\d+)?)\s+(\d+(?:,\d+)?)/, 'g');
    const regex2 = new RegExp(/Energia compensada GD IkWh\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:.\d+)?)\s+((-)?(?:(\d{1,3}(?:\.\d{3})*)?)(?:,(\d{2}))?)\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:.\d+)?)\s+(-?\d+(?:.\d+)?)/, 'g');

    const result1 = regex1.exec(text);
    if (result1) {
        const [, quantity, priceUnit, value, tax] = result1;
        return {
            quantity: parse(quantity),
            priceUnit: parse(priceUnit),
            value: parse(value),
            tax: parse(tax),
        }
    }

    const result2 = regex2.exec(text);
    if (result2) {
        const [, quantity, priceUnit, value, , , , , , tax] = result2;

        return {
            quantity: parse(quantity),
            priceUnit: parse(priceUnit),
            value: parse(value),
            tax: parse(tax),
        }
    }

}

const extractPublicEnergyInformation = (text: string) => {
    const regex = new RegExp(/Contrib Ilum Publica Municipal\s+(-?\d+(?:,\d+)?)/);
    const [, value] = regex.exec(text) || [];

    return {
        value: parse(value),
    }

}

const extractTotalValue = (text: string) => {
    const regex = new RegExp(/TOTAL\s+(-?\d+(?:,\d+)?)/);
    const [, value] = regex.exec(text) || [];

    return {
        value: parse(value),
    }
}

export const getData = async (text: string) => {

    const personal = extractPersonalInformation(text);
    const general = extractGeneralInformation(text);
    const electricalEnergy = extractElectricalEnergyInformation(text);
    const scee = extractSceeInformation(text);
    const compensatedEnergy = extractCompensatedEnergyInformation(text);
    const publicEnergy = extractPublicEnergyInformation(text);
    const total = extractTotalValue(text);

    return {
        personal,
        general,
        electricalEnergy,
        scee,
        compensatedEnergy,
        publicEnergy,
        total,
    }

}
