import { QueryFailedError } from 'typeorm';

export function Retry(retries = 3, delayMs = 100): MethodDecorator {
    return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let attempts = retries;

            while (attempts--) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    if (error instanceof QueryFailedError && (error as any).code === '40001') {
                        console.log('Deadlock detected, retrying...');
                        await new Promise((resolve) => setTimeout(resolve, delayMs)); 
                        continue; 
                    }

                    throw error;
                }
            }

            throw new Error('Transaction failed after multiple retries');
        };
    };
}
