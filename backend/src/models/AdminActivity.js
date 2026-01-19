import mongoose from 'mongoose';

const AdminActivitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['ROLE_CHANGE', 'USER_DELETE', 'PASSWORD_UPDATE', 'USER_UPDATE'], required: true },
    metadata: { type: Object }
  },
  { timestamps: true }
);

const AdminActivity = mongoose.model('AdminActivity', AdminActivitySchema);
export default AdminActivity;
