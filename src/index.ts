import * as dotenv from 'dotenv';
dotenv.config();

import { ImpersonatorClient } from './structures/Client';

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

export const client = new ImpersonatorClient();
client.start();
