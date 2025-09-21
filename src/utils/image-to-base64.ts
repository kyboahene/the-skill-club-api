import fs from 'fs'

export function imageToBase64(imagePath: string) {
    const buffer = fs.readFileSync(imagePath);
    const base64String = buffer.toString('base64');

    return base64String;
}