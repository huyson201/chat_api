import { JwtPayload } from '@helpers/createToken';

declare global {
    namespace Express {
        export interface Request {
            user?: JwtPayload;
        }
    }
}