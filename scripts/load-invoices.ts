import {readdirSync, readFileSync} from 'fs';
import {readFile as _readFile, renameSync, writeFileSync} from "node:fs";
import {getData} from "../src/lib";
const pdf = require('pdf-parse');

// path das faturas
const invoicesPath = '/home/ale/Archive/Develop/test-lumi/Develop/boletos-api/playground/faturas';

// carregas itens do diretório
const files = readdirSync(invoicesPath);

/**
 * Converte um PDF em Texto
 */
const pdftoText = async (_buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        pdf(_buffer).then(({text}: {text: string }) => {
            resolve(text);
        });
    });
}



(async () => {

    // lê os arquivos simultaneamente
    const promises = files
        .filter(file => file.endsWith('.pdf'))
        .map(file => new Promise(async (resolve, reject) => {

            // path do arquivo
            const path = `${invoicesPath}/${file}`;

            // lê o arquivo
            const _buffer = readFileSync(path);

            // converte PDF em Texto
            const text = await pdftoText(_buffer);

            // recupera dados do PDF
            const data = await getData(text);

            // move para processados
            renameSync(path, `${invoicesPath}/processed/${file}`);

            // // persiste resultado
            // writeFileSync(path.replace('.pdf', '.json'), JSON.stringify(data, null, 2), { encoding: 'utf-8' });

            resolve(data);
        }));

    // resolve promisses
    const list = await Promise.all(promises);

    // persiste resultado
    writeFileSync(`${invoicesPath}/out.json`, JSON.stringify(list, null, 2), { encoding: 'utf-8' });

    console.log(list);

})()

