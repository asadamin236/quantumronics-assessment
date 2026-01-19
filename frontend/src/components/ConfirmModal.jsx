import React from 'react';

const ConfirmModal = ({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, single }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          {single ? (
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onCancel}>{cancelText}</button>
          ) : (
            <>
              <button className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>{cancelText}</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onConfirm}>{confirmText}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
