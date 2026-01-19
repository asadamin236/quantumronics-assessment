import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const roleClass = (role) => {
  if (role === 'Admin') return 'bg-purple-100 text-purple-700';
  if (role === 'Manager') return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

const UserTable = ({ users, onChangeRole, onDelete, onChangePassword, onUpdateUser, canDelete = false, canEditRole = false, currentUserId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSingle, setModalSingle] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMsg, setModalMsg] = useState('');
  const [pending, setPending] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPwd, setEditPwd] = useState('');
  const [editErr, setEditErr] = useState('');

  const handleSelect = (userId, newRole, isSelf) => {
    if (isSelf) {
      setModalTitle('Action not allowed');
      setModalMsg('You cannot change your own role');
      setModalSingle(true);
      setModalOpen(true);
      return;
    }
    setModalTitle('Confirm Role Change');
    setModalMsg(`Change this user role to "${newRole}"?`);
    setModalSingle(false);
    setModalOpen(true);
  };

  const confirm = async () => {
    if (pending?.type === 'role') {
      await onChangeRole(pending.userId, pending.newRole);
    } else if (pending?.type === 'delete') {
      await onDelete(pending.userId);
    }
    setPending(null);
    setModalOpen(false);
  };

  const cancel = () => {
    setPending(null);
    setModalOpen(false);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold">Users</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Role</th>
            <th className="text-left px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${roleClass(u.role)}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                      value={u.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setPending({ type: 'role', userId: u._id, newRole });
                        handleSelect(u._id, newRole, u._id === currentUserId);
                      }}
                    disabled={!canEditRole || u._id === currentUserId}
                    >
                      <option>User</option>
                      <option>Manager</option>
                      <option>Admin</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="Update user"
                        onClick={() => {
                          const target = users.find(x => x._id === u._id) || u;
                          setEditUserId(u._id);
                          setEditName(target.name || '');
                          setEditEmail(target.email || '');
                          setEditPwd('');
                          setEditErr('');
                          setEditOpen(true);
                        }}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-red-50 text-red-600 disabled:text-gray-400 disabled:hover:bg-transparent"
                        title="Delete user"
                        disabled={!canDelete || u._id === currentUserId}
                        onClick={() => {
                          if (u._id === currentUserId) {
                            setModalTitle('Action not allowed');
                            setModalMsg('You cannot delete your own account');
                            setModalSingle(true);
                            setModalOpen(true);
                            return;
                          }
                          setPending({ type: 'delete', userId: u._id });
                          setModalTitle('Confirm Delete');
                          setModalMsg(`Delete ${u.email}? This cannot be undone.`);
                          setModalSingle(false);
                          setModalOpen(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {u._id === currentUserId && <span className="text-xs text-gray-500">You cannot change your own role</span>}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="text-lg font-semibold mb-2">Update User</div>
            <div className="text-sm text-gray-600 mb-4">Edit name, email, and optionally password.</div>
            <input
              type="text"
              className="border rounded w-full px-3 py-2 mb-2"
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="email"
              className="border rounded w-full px-3 py-2 mb-2"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <input
              type="password"
              className="border rounded w-full px-3 py-2 mb-2"
              placeholder="New password"
              value={editPwd}
              onChange={(e) => setEditPwd(e.target.value)}
            />
            {editErr && <div className="text-sm text-red-600 mb-2">{editErr}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditOpen(false)}>Cancel</button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={async () => {
                  setEditErr('');
                  if (!editName || !editEmail) {
                    setEditErr('Name and email are required');
                    return;
                  }
                  try {
                    await onUpdateUser(editUserId, { name: editName, email: editEmail });
                    if (editPwd && editPwd.length >= 6) {
                      await onChangePassword(editUserId, editPwd);
                    }
                    setEditOpen(false);
                  } catch (e) {
                    setEditErr(e?.response?.data?.message || e.message || 'Failed to update user');
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={modalOpen}
        title={modalTitle}
        message={modalMsg}
        onConfirm={confirm}
        onCancel={cancel}
        single={modalSingle}
      />
    </div>
  );
};

export default UserTable;
