import { QueryFailedError } from 'typeorm';

export function Retry(retries = 3): MethodDecorator {
    return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let attempts = retries;

            while (attempts--) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {

                    if (error instanceof QueryFailedError && 'code' in error && error.code === '40001') {
                        console.log('Deadlock detected, retrying...');
                    }

                    throw error;
                }
            }

            throw new Error('A transação falhou após múltiplas tentativas');
        };
    };
}
