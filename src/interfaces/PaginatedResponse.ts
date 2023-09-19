import { ObjectType } from 'dynamoose/dist/General';

export interface PaginatedResponse {
  items: any;
  lastKey: ObjectType;
}
