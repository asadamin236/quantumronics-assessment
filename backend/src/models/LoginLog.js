import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    provider: { type: String, default: 'local' },
    ip: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const LoginLog = mongoose.model('LoginLog', LoginLogSchema);
export default LoginLog;
