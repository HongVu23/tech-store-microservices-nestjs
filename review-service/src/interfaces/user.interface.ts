import { Types } from "mongoose";

export interface User {
    id: Types.ObjectId;
    username: string;
    role: string;
}