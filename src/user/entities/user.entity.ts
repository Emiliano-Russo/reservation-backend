import * as dynamoose from 'dynamoose';

const UserSchema = new dynamoose.Schema({
  createdAt: { type: Date, default: Date.now },
  id: { type: String, hashKey: true },
  provider: String,
  googleId: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  civilIdDoc: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, required: false },
  chats: { type: Array, schema: [String], required: false },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, required: false },
});

export const User = dynamoose.model('User', UserSchema);
