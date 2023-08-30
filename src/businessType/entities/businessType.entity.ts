import * as dynamoose from 'dynamoose';
import { AnyItem } from "dynamoose/dist/Item";


const BusinessTypeSchema = new dynamoose.Schema({
    id: { type: String, hashKey: true },
    name: { type: String, required: true },
    description: { type: String },
});

export interface IBusinessType extends AnyItem {
    id: String;
    name: String;
    description: String;
}

export const BusinessType = dynamoose.model<IBusinessType>("BusinessType", BusinessTypeSchema);