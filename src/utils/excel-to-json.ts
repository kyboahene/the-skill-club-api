import { readFile, utils } from 'xlsx';

export function excelToJson(filePath: string) {
    try {
        const wb = readFile(filePath);
        const ws = wb.Sheets[wb.SheetNames[0]];

        const data = utils.sheet_to_json(ws, { raw: false, dateNF: 'mm/dd/yyyy' });

        return data;
    } catch (error) {
        throw new Error(error);
    }
}
