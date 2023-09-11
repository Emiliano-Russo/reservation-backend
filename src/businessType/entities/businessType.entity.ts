import * as dynamoose from 'dynamoose';
import { AnyItem } from 'dynamoose/dist/Item';

export enum ControlType {
  SELECT_ONE = 'select-one',
  COUNTER = 'counter',
  CHECKBOX = 'checkbox',
  SELECT_MULTIPLE = 'select-multiple',
}

const ControlSchema = new dynamoose.Schema(
  {
    type: { type: String, enum: Object.values(ControlType), required: true },
    label: { type: String, required: true },
    options: { type: Array, schema: [String] }, // Array de cadenas
    default: {
      type: String, // Puede ser String, Number o Array dependiendo del control
    },
    min: Number,
    max: Number,
  },
  { saveUnknown: true },
); // Esta opción permite que propiedades desconocidas sean guardadas en DynamoDB

const BusinessTypeSchema = new dynamoose.Schema({
  id: { type: String, hashKey: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, required: true },
  controls: {
    type: Array,
    schema: [ControlSchema], // Esquema definido anteriormente para los controles
  },
});

export interface IControl {
  type: String;
  label: String;
  options?: String[];
  default?: String;
  min?: Number;
  max?: Number;
}

export interface IBusinessType extends AnyItem {
  id: String;
  name: String;
  description: String;
  icon: String;
  controls?: IControl[];
}

export const BusinessType = dynamoose.model<IBusinessType>(
  'BusinessType',
  BusinessTypeSchema,
);
