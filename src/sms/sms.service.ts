import axios, { AxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
    private readonly endPoint: string;

    constructor() {
        this.endPoint = 'https://smsc.hubtel.com/v1/messages/send';
    }

    public async sendSMS(recipient: string, message: string): Promise<any> {
        const url = this.endPoint;

        const data = JSON.stringify({
            from: process.env.FROM,
            to: recipient,
            content: message,
        });

        const config: AxiosRequestConfig = {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString(
                        "base64"
                    ),
            },
        };

        try {
            const response = await axios.post(url, data, config);
            return response.data;
        } catch (error) {
            console.error(`Error sending SMS: ${error.message}`);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }
}
