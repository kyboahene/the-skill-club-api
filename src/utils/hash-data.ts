import { hash } from "bcryptjs"

export async function hashData(data: string) {
    return hash(data, 10);
}