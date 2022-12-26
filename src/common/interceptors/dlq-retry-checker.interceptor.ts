import { isRabbitContext } from "@golevelup/nestjs-rabbitmq";
import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { DLQ_DEFAULT_RETRIES_COUNT } from "../constants/dlq-retries.constant";

export const DLQRetryCheckerInterceptor = (queueName: string, retryCount: number = DLQ_DEFAULT_RETRIES_COUNT) => {
    return class Interceptor implements NestInterceptor {
        intercept(context: ExecutionContext, next: CallHandler<any>): Observable<void> {
            if (isRabbitContext(context)) {
                console.log(JSON.stringify(context.getArgs()))
                const headers = context.getArgs()[2];
                const hasDied = headers['x-first-death-queue'] === queueName;


                if (hasDied) {
                    const death = headers['x-death'].find(d => d.reason === 'expired')


                    if (death.count >= retryCount) {
                        console.log('retry count exceeded, sadge');
                        return;
                    }
                }

                return next.handle();
            }

            throw new Error('not a rmq context');
        }
    }
}

