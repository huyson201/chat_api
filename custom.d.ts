import { JwtPayload } from '@helpers/createToken';
import { IUser } from '@models/User';

declare global {
    namespace Express {
        export interface Request {
            user?: JwtPayload | IUser;
        }
    }
}