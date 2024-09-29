import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<any> {
    catch(exception: any /*host: ArgumentsHost*/): Observable<any> {

        console.log({exception})

        if (exception instanceof RpcException) {
            return throwError(() => exception.getError());
        } else if (exception instanceof Error && (exception.name == 'ValidationError' || exception.name == 'MongoServerError')) {
            return throwError(() => ({ statusCode: HttpStatus.BAD_REQUEST, message: exception.message }));
        } else {
            console.log(exception.stack)
            return throwError(() => ({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' }));
        }
    }
}