import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onOk={handleConfirm}
      onCancel={onClose}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger: type === "danger" }}
      icon={<ExclamationCircleOutlined />}
    >
      <p>{message}</p>
    </Modal>
  );
};
